import jwt
import os
import json
import bcrypt
import sqlalchemy
import string
import random
import pandas as pd
import numpy as np
from sanic_ext import cors
from datetime import datetime
from sanic import Blueprint
from sanic.response import json as sanic_json, text, file, file_stream
from sqlalchemy import insert, update, delete, select
from web.auth import protected
from web.routes.project_routes import check_access
from web.db_connection import (
    engine,
    tk_users_table,
    tk_project_owner_table,
    tk_user_campaign_table,
    tk_campaigns_table,
    tk_projects_table
)

users = Blueprint('users')

config = {}
config["upload"] = "web/uploads"


def generate_pass():
    characters = string.ascii_letters + string.digits + '!@#$%^&*()'
    password = ''.join(random.choice(characters) for i in range(12))
    return password


def add_user(request_data):
    hash = bcrypt.hashpw(
        request_data['password'].encode('utf-8'), bcrypt.gensalt())

    with engine.begin() as conn:
        conn.execute(insert(tk_users_table).values(
            name=request_data['name'],
            last_name=request_data['last_name'],
            login=request_data['login'],
            moccarz_id=request_data['mocarz_id'],
            password=hash,
            koordynator=request_data['koordynator'],
            project_owner=request_data['project_owner'],
            edited_by=request_data['who_added']
        ))
        project_data = request_data.get('projects', None)
        if project_data:
            campaigns_data = request_data.get('campaigns', None)
            if request_data['project_owner']:
                for project in project_data:
                    conn.execute(insert(tk_project_owner_table).values(
                        login=request_data['login'],
                        project_code=project
                    ))
            elif request_data['koordynator']:
                for campaign in campaigns_data:
                    conn.execute(insert_query(
                        request_data['login'],
                        campaign,
                        True,
                    ))
            else:
                for campaign in campaigns_data:
                    conn.execute(insert_query(
                        request_data['login'],
                        campaign
                    ))


def insert_query(login, project=None,  koordynator=False):
    return insert(tk_user_campaign_table).values(
        login=login,
        koordynator=koordynator,
        campaign_id=project
    )


@users.post('/api/register')
@protected
async def register(request):
    request_data = request.json
    password = request.json.get('password')
    mocarz_id = request.json.get('mocarz_id', None)
    hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        with engine.begin() as conn:

            conn.execute(insert(tk_users_table).values(
                name=request_data['name'],
                last_name=request_data['last_name'],
                login=request_data['login'],
                moccarz_id=mocarz_id,
                password=hash,
                koordynator=request_data['koordynator'],
                project_owner=request_data['project_owner'],
                edited_by=request_data['who_added']
            ))
            project_data = request_data.get('projects', None)
            if project_data:
                campaigns_data = request_data.get('campaigns', None)
                if request_data['project_owner']:
                    for project in project_data:
                        conn.execute(insert(tk_project_owner_table).values(
                            login=request_data['login'],
                            project_code=project
                        ))
                elif request_data['koordynator']:
                    for campaign in campaigns_data:
                        conn.execute(insert_query(
                            request_data['login'],
                            campaign,
                            True,
                        ))
                else:
                    for campaign in campaigns_data:
                        conn.execute(insert_query(
                            request_data['login'],
                            campaign
                        ))
            # else:
            #     if request_data['koordynator']:
            #         conn.execute(insert_query(tk_project_owner_table,
            #                                   request_data['login']
            #                                   ))
            #     else:
            #         conn.execute(insert_query(tk_user_campaign_table,
            #                                   request_data['login']
            #                                   ))
                # return text(f"Welcome, {login}")
            return sanic_json({"added": True, 'message': f"{request_data['login']}'s account was created succesfully"})
    except sqlalchemy.exc.IntegrityError as e:
        if "Duplicate entry" in str(e.args[0]):
            return sanic_json({"added": False, "message": "User already exists"})
        else:
            return text(str(e))


@users.get('/api/dl_file/<file_name>')
def download_file(request, file_name):
    return_file = f"{config['upload']}/{file_name}"
    return file(return_file)


@users.post('/api/multiregister')
@cors(expose_headers=['fileName'])
def add_from_file(request):
    if not os.path.exists(config["upload"]):
        os.makedirs(config["upload"])
    projects = request.form['projects']
    campaigns = request.form['campaigns']
    who_added = request.form['who_added'][0]
    file_received = request.files.get('file')
    file_parameters = {
        'body': file_received.body,
        'name': file_received.name,
        'type': file_received.type,
    }
    file_name_split = file_parameters['name'].split('.')
    file_name = datetime.now().strftime("%Y-%m-%d-%H-%M-%S") + \
        '_'+file_name_split[0]+'_upload'
    if file_name_split[-1] == 'xlsx' or file_name_split[-1] == 'xlsx':
        file_path = f"{config['upload']}/{file_name}.xlsx"

        with open(file_path, 'wb') as f:
            f.write(file_parameters['body'])
            f.close()
        initial_df = pd.read_excel(file_path)
        df = initial_df.replace({np.nan: None})
        logins_from_file = list(df['Login'])
        with engine.begin() as conn:
            existing_logins = conn.execute(select(tk_users_table.c.login).where(
                tk_users_table.c.login.in_(logins_from_file)
            ))
        existing_logins_table = []
        for login in existing_logins:
            df = df[df.Login != login.login]
            existing_logins_table.append(login.login)
        row_count = len(df.index)
        if row_count > 0:
            if not 'Haslo' in df.columns:
                pass_table = []
                for num in range(0, row_count):
                    pass_table.append(generate_pass())
                df['Haslo'] = pass_table
            for ind in df.index:
                koordynator_info = df['Koordynator (TAK/NIE)'][ind].upper().strip()
                po_info = df['Project Owner (TAK/NIE)'][ind].upper().strip()
                request_data = {
                    'name': df['Imie'][ind],
                    'last_name': df['Nazwisko'][ind],
                    'login': df['Login'][ind],
                    'password': str(df['Haslo'][ind]),
                    'mocarz_id': df['MocarzId'][ind] if df['MocarzId'][ind] != "" else None,
                    'koordynator': True if koordynator_info == 'TAK' or po_info == 'TAK' else False,
                    'project_owner': True if po_info == 'TAK' else False,
                    'projects': projects if projects[0] != '' else None,
                    'campaigns': campaigns if campaigns[0] != '' else None,
                    'who_added': who_added
                }
                add_user(request_data=request_data)

            return_csv = f"{config['upload']}/{file_name}.csv"
            df.to_csv(return_csv, sep=",", index=False)
            os.remove(file_path)
            # return file(return_csv, headers={'fileName': f"{file_name}.csv"})
            return sanic_json({
                'file_address': f"{file_name}.csv",
                'existing_logins': existing_logins_table
            })
        else:
            os.remove(file_path)
            return text('All users are already in the system!', 403)
    else:
        return sanic_json({'msg': 'Wrong file extension, should be .xlsx/.xls!'}, 403)


@users.post('/api/delete_data')
def delete_data(request):
    file_name = request.json.get('fileName')
    file_path = f"{config['upload']}/{file_name}"
    os.remove(file_path)
    return text(f"File {file_name} was deleted!")


@ users.post('/api/login')
def login(request):
    login = request.json.get('login')
    password = request.json.get('password')
    response = {}
    with engine.begin() as conn:
        # Wyszukujemy użytkownika z bazy danych wyszukując po loginie przesłanym w requeście
        user = conn.execute(tk_users_table.select().where(
            tk_users_table.c.login == login)).first()
    # Jeśli użytkownika nie ma zwracamy 404
    if not user:
        return sanic_json({"message": "User doesn't exist"}, 404)
    else:
        # Za pomocą bcrypta porównujemy czy hasło zgadza się z zaenkryptowanym hasłem z bazy danych. Jeśli tak, przechodzimy dalej.
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            # Jeśli użytkownik jest aktywny, to zwracamy jego login, imię, nazwisko, poziom dostępu i stronę startową, do której zostanie przekierowany na frontendzie.
            if user.active:
                user_data = {
                    'login': user.login,
                    'name': user.name,
                    'last_name': user.last_name
                }
                if user.admin:
                    user_data['access_level'] = "admin"
                    user_data['start_page'] = 'control-panel'
                elif user.project_owner:
                    user_data['access_level'] = "projectOwner"
                    user_data['start_page'] = 'control-panel'
                elif user.koordynator:
                    user_data['access_level'] = "koordynator"
                    user_data['start_page'] = 'control-panel'
                else:
                    user_data['access_level'] = "user"
                    user_data['start_page'] = 'counter'
                # Dane użytkownika zwracamy w formie JWT do rozszyfrowania po stronie frontendu.
                response = jwt.encode(user_data, request.app.config.SECRET)
                return text(response, 200)
            else:
                return sanic_json({"message": "User inactive"}, 404)
        else:
            return sanic_json({"message": "Wrong credentials"}, 401)


@ users.post('/api/reset_password')
@ protected
async def reset_pass(request):
    login = request.json.get('login')
    password = request.json.get('password')
    # Hashujemy hasło za pomocą bcrypta dla bezpiecznego przechowywania w bazie danych
    hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    with engine.begin() as conn:
        # Aktualizujemy hasło w rekordzie z bazy danych wyszukując po loginie przesłanym w requeście
        conn.execute(update(tk_users_table).where(
            tk_users_table.c.login == login).values(
            password=hash
        )
        )
    return text("Password changed")


@ users.post('/api/delete_user')
@ protected
async def delete_user(request):
    login = request.json.get('login')

    def delete_handler(table, login):
        delete_query = delete(table).where(
            table.c.login == login
        )
        return delete_query
    with engine.begin() as conn:
        # Wyszukujemy użytkownika na podstawie loginu przekazanego w requeście
        user = conn.execute(tk_users_table.select().where(
            tk_users_table.c.login == login)).first()
        # Jeśli użytkownik jest koordynatorem usuwamy go z listy koordynatorów i ich projektów
        # Jeśli jest zwykłym użytkownikiem usuwamy go z listy użytkowników i ich projektów
        if user.koordynator:
            conn.execute(delete_handler(tk_project_owner_table, login))
        else:
            conn.execute(delete_handler(tk_user_campaign_table, login))
        # Usuwamy użytkownika z tabeli tk_users
        conn.execute(delete_handler(tk_users_table, login))
    return text("User deleted!")


@ users.post('/api/user_activation')
@ protected
async def user_activation(request):
    login = request.json.get('login')
    activate = request.json.get('activate')
    try:
        with engine.begin() as conn:
            # Wyszukujemy użytkownika na podstawie loginu przekazanego w requeście
            if activate:
                conn.execute(update(tk_users_table).where(
                    tk_users_table.c.login == login
                ).values(
                    active=True
                )
                )
                return text("User activated")
            else:
                conn.execute(update(tk_users_table).where(
                    tk_users_table.c.login == login
                ).values(
                    active=False
                )
                )
                return text("User deactivated")
    except AttributeError:
        return text("User not found", 404)


@users.post('/api/user_promotion')
@protected
async def user_position(request):
    login = request.json.get('login')
    promote = request.json.get('activate')
    try:
        with engine.begin() as conn:
            user = conn.execute(tk_users_table.select().where(
                tk_users_table.c.login == login)).first()

            def koordynator_handler(table, bool):
                conn.execute(update(table).where(
                    table.c.login == login
                ).values(
                    koordynator=bool
                )
                )

            def migrate_project_data(table_from, table_to):
                user_projects = conn.execute(select(table_from).where(
                    table_from.c.login == login)
                )

                def find_project_code(campaign):
                    query = select(tk_projects_table.c.project_code).select_from(tk_projects_table).join(
                        tk_campaigns_table, tk_projects_table.c.id == tk_campaigns_table.c.project_id, isouter=True
                    ).join(
                        tk_user_campaign_table, tk_campaigns_table.c.campaign_id == tk_user_campaign_table.c.campaign_id, isouter=True
                    ).where(
                        tk_user_campaign_table.c.campaign_id == campaign
                    )
                    return query
                codes_table = []
                for project in user_projects:
                    project_code = conn.execute(
                        find_project_code(project.campaign_id)).first()
                    if project_code and project_code.project_code not in codes_table:
                        codes_table.append(project_code.project_code)
                        conn.execute(
                            insert(table_to).values(
                                login=project.login,
                                project_code=project_code.project_code
                            )
                        )

                conn.execute(
                    delete(table_from).where(
                        table_from.c.login == login
                    )
                )

            if promote:
                position = request.json.get('position')
                if position == 'koordynator':
                    koordynator_handler(tk_users_table, True)
                    koordynator_handler(tk_user_campaign_table, True)
                    # migrate_project_data(
                    #     tk_user_campaign_table, tk_project_owner_table)
                else:
                    conn.execute(update(tk_users_table).where(
                        tk_users_table.c.login == login
                    ).values(
                        project_owner=True
                    )
                    )
                    migrate_project_data(
                        tk_user_campaign_table, tk_project_owner_table)
                current_status = 'coordinator' if position == 'koordynator' else 'project owner'
                return text(f"User promoted to {current_status}!")
            else:
                position = request.json.get('position')
                if position == 'koordynator':
                    conn.execute(update(tk_users_table).where(
                        tk_users_table.c.login == login
                    ).values(
                        koordynator=True,
                        project_owner=False
                    )
                    )
                    conn.execute(
                        delete(tk_project_owner_table).where(
                            tk_project_owner_table.c.login == login
                        )
                    )
                else:
                    koordynator_handler(tk_users_table, False)
                    koordynator_handler(tk_user_campaign_table, False)
                # conn.execute(update(tk_users_table).where(
                #     tk_users_table.c.login == login
                # ).values(
                #     koordynator=koordynator_value,
                #     project_owner=project_owner_value
                # )
                # )
                # migrate_project_data(
                #     tk_project_owner_table, tk_user_campaign_table, 'demote')
                return text(f"User demoted!")
    except AttributeError:
        return text("User not found", 404)


@users.get('/api/get_users/<user>')
@protected
async def get_users(request, user):

    def select_users(coordinator_bool=False, po_bool=False, admin_bool=False):
        query = select(tk_users_table.c.login,
                       #  (tk_users_table.c.name + " " +
                       #   tk_users_table.c.last_name).label("full_name")
                       tk_users_table.c.name,
                       tk_users_table.c.last_name
                       ).select_from(tk_users_table).where(
            tk_users_table.c.admin == admin_bool,
            tk_users_table.c.koordynator == coordinator_bool,
            tk_users_table.c.project_owner == po_bool,
            tk_users_table.c.active == True
        )
        return query

    def select_inactive():
        inactive_query = select(tk_users_table.c.login,
                                tk_users_table.c.name,
                                tk_users_table.c.last_name
                                ).where(
            tk_users_table.c.active == False
        )
        return inactive_query
    access_level = check_access(user)
    if access_level == 'admin':
        selected_users = select_users()
        selected_coordinators = select_users(True)
        selected_owners = select_users(True, True)
        selected_inactive = select_inactive()
    elif access_level == 'project_owner':
        subquery = select(tk_campaigns_table.c.campaign_id).select_from(
            tk_campaigns_table
        ).join(
            tk_projects_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id
        ).join(
            tk_project_owner_table, tk_project_owner_table.c.project_code == tk_projects_table.c.project_code
        ).where(
            tk_project_owner_table.c.login == user
        )

        selected_users = select_users().join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.login == tk_users_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id.in_(subquery)
        )

        selected_coordinators = select_users(True).join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.login == tk_users_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id.in_(subquery)
        )

        selected_owners = select_users(True, True).join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.login == tk_users_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id.in_(subquery)
        )

        selected_inactive = select_inactive().join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.login == tk_users_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id.in_(subquery)
        )
    else:
        subquery = select(tk_user_campaign_table.c.campaign_id).where(
            tk_user_campaign_table.c.login == user
        )

        selected_users = select_users().join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.login == tk_users_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id.in_(subquery)
        )

        selected_inactive = select_inactive().join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.login == tk_users_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id.in_(subquery)
        )

    with engine.begin() as conn:
        users_result = conn.execute(selected_users).fetchall()
        inactive_result = conn.execute(selected_inactive).fetchall()
        if access_level == 'admin' or access_level == 'project_owner':
            coordinators_result = conn.execute(
                selected_coordinators).fetchall()
            po_result = conn.execute(selected_owners).fetchall()
        else:
            coordinators_result = []
            po_result = []
    users_result = list(dict.fromkeys(users_result))
    coordinators_result = list(dict.fromkeys(coordinators_result))
    po_result = list(dict.fromkeys(po_result))
    inactive_result = list(dict.fromkeys(inactive_result))
    response = {
        'users': [{'login': user.login, 'name': user.name, 'last_name': user.last_name} for user in users_result],
        'coordinators': [{'login': user.login, 'name': user.name, 'last_name': user.last_name} for user in coordinators_result],
        'owners': [{'login': user.login, 'name': user.name, 'last_name': user.last_name} for user in po_result],
        'inactive': [{'login': user.login, 'name': user.name, 'last_name': user.last_name} for user in inactive_result]
    }
    return sanic_json(json.dumps(response, default=str, ensure_ascii=False))


@users.post('/api/change_user_data')
@protected
async def change_data(request):
    data = request.json
    
    def update_logins(table):
        with engine.begin() as conn:
            conn.execute(update(table).where(
                table.c.login == data['old_login']
            ).values(
                login=data['new_login']
            ))
    with engine.begin() as conn:
        conn.execute(update(tk_users_table).where(
            tk_users_table.c.login == data['old_login']
        ).values(
            name=data['name'],
            last_name=data['last_name'],
            edited_by=data['edited_by']
        ))
    if data['new_login']:
        update_logins(tk_users_table)
        update_logins(tk_user_campaign_table)
        update_logins(tk_project_owner_table)

    return text('Data changed successfully!')
