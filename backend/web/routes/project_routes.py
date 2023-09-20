import json
# import pytz
# import time
# from io import BytesIO
# from itertools import groupby
# import pandas as pd
# import numpy as np
from datetime import date, timedelta, datetime
from sanic import Blueprint
from collections import defaultdict
from sanic.response import json as sanic_json, text
from sqlalchemy import select, union_all, insert, update, delete, cast, Time
# from web.routes.work_history_routes import work_history_query
from web.auth import protected
from web.db_connection import (
    engine,
    tk_users_table,
    tk_campaigns_table,
    tk_current_work_table,
    tk_user_campaign_table,
    tk_project_owner_table,
    tk_campaign_statuses_table,
    tk_projects_table,
    tk_clients_table,
)

project = Blueprint('project')


@project.post('/api/create_project')
@protected
async def create_project(request):
    starting_hours = request.json['starting_hours']
    ending_hours = request.json['ending_hours']
    logout_buffer = request.json['logout_buffer']
    ending_next_day = ending_hours < starting_hours
    today = date.today()
    tomorrow = date.today() + timedelta(days=1)
    if ending_next_day:
        next_ghost = f'{tomorrow} {ending_hours}:00'
    else:
        next_ghost = f'{today} {ending_hours}:00'
    next_ghost_dt = datetime.strptime(
        next_ghost, "%Y-%m-%d %H:%M:%S") + timedelta(minutes=logout_buffer) + timedelta(minutes=5)

    def find_client(project):
        find_client_query = select(
            tk_projects_table.c.id.label("project_id"),
            tk_projects_table.c.project_code
        ).where(tk_projects_table.c.project_name == project)
        return find_client_query

    def populate_user_project_table(input_data, campaign_id, koordynator=False):
        for each in input_data:
            conn.execute(insert(tk_user_campaign_table).values(
                login=each,
                campaign_id=campaign_id,
                koordynator=koordynator,
            )
            )

    with engine.begin() as conn:
        parent_data = conn.execute(
            find_client(request.json['project'])).first()
        campaign_id = f"{request.json['campaign_name']}_{parent_data.project_code}"
        conn.execute(insert(tk_campaigns_table).values(
            project_id=parent_data.project_id,
            campaign_id=campaign_id,
            campaign_name=request.json['campaign_name'],
            starting_hours=request.json['starting_hours'],
            ending_hours=request.json['ending_hours'],
            ending_next_day=ending_next_day,
            logout_buffer=logout_buffer,
            next_ghost_creation=next_ghost_dt if request.json['add_ghosts'] else None,
            edited_by=request.json['edited_by']
        )
        )
        populate_user_project_table(request.json['users'], campaign_id)
        populate_user_project_table(
            request.json['coordinators'], campaign_id, True)
        for status in request.json['statuses']:
            conn.execute(insert(tk_campaign_statuses_table).values(
                campaign_id=campaign_id,
                campaign_status=status
            ))
        # print("Project: ", project)

        # print(f"{request.json['campaign_name']}_{result.project_code}")
    # with engine.begin() as conn:
    #     def populate_additional_tables(table_name, input_data):
    #         for each in input_data:
    #             conn.execute(insert(table_name).values(
    #                 login=each,
    #                 campaign_id=request.json['campaign_id']
    #             )
    #             )
    #     conn.execute(insert(tk_campaigns_table).values(
    #         campaign_id=request.json['campaign_id'],
    #         project_code=request.json['project_code'],
    #         campaign_name=request.json['campaign_name'],
    #         starting_hours=request.json['starting_hours'],
    #         ending_hours=request.json['ending_hours'],
    #         ending_next_day=ending_next_day,
    #         logout_buffer=logout_buffer,
    #         next_ghost_creation=next_ghost_dt,
    #         edited_by=request.json['edited_by']
    #     )
    #     )
    # #     populate_additional_tables(
    #         tk_project_owner_table, request.json['owners'])
    #     populate_additional_tables(
    #         tk_project_owner_table, request.json['coordinators'])
    #     populate_additional_tables(
    #         tk_user_campaign_table, request.json['users'])

    return text('Project created!')


@project.get("/test_ip")
def test_ip(request):
    request_ip = request.ip
    return text(f"IP: {request_ip}")


@project.post('/api/update_project')
@protected
async def update_project(request):
    request_ip = request.ip
    campaign_id = request.json.get('campaign_id')

    def check_user(login):
        query = select(
            tk_user_campaign_table
        ).where(
            tk_user_campaign_table.c.login == login,
            tk_user_campaign_table.c.campaign_id == campaign_id
        )

        return query

    def check_status(status):
        query = select(
            tk_campaign_statuses_table
        ).where(
            tk_campaign_statuses_table.c.campaign_status == status,
            tk_campaign_statuses_table.c.campaign_id == campaign_id
        )

        return query

    def insert_user(login, koordynator_val=False):
        query = insert(
            tk_user_campaign_table
        ).values(
            login=login,
            campaign_id=campaign_id,
            koordynator=koordynator_val
        )
        return query

    def insert_status(status):
        query = insert(
            tk_campaign_statuses_table
        ).values(
            campaign_status=status,
            campaign_id=campaign_id,
        )
        return query

    def create_or_ignore_user(iterator, koordynator_val):
        for user in iterator:
            user_exists = conn.execute(
                check_user(user)
            ).first()
            if not user_exists:
                print(f'No such user as {user} - needs to be added')
                conn.execute(insert_user(user, koordynator_val))

    def create_or_ignore_status(iterator):
        for status in iterator:
            status_exists = conn.execute(
                check_status(status)
            ).first()
            if not status_exists:
                print(f'No such user as {status} - needs to be added')
                conn.execute(insert_status(status))

    def delete_user(iterator):
        for user in iterator:
            conn.execute(
                delete(
                    tk_user_campaign_table
                ).where(
                    tk_user_campaign_table.c.login == user,
                    tk_user_campaign_table.c.campaign_id == campaign_id
                )
            )

    def delete_status(iterator):
        for status in iterator:
            conn.execute(
                delete(
                    tk_campaign_statuses_table
                ).where(
                    tk_campaign_statuses_table.c.campaign_status == status,
                    tk_campaign_statuses_table.c.campaign_id == campaign_id
                )
            )

    with engine.begin() as conn:
        if request.json['new_starting_hours'] and request.json['new_ending_hours']:
            query = select(tk_campaigns_table.c.logout_buffer).where(
                tk_campaigns_table.c.campaign_id == campaign_id
            )
            project_to_update = conn.execute(query).first()
            ending_hours = request.json['new_ending_hours']
            starting_hours = request.json['new_starting_hours']
            create_ghosts = request.json['ghosts']
            ending_next_day = ending_hours < starting_hours
            today = date.today()
            tomorrow = date.today() + timedelta(days=1)
            if ending_next_day:
                next_ghost = f'{tomorrow} {ending_hours}:00'
                update_next_day = True
            else:
                next_ghost = f'{today} {ending_hours}:00'
                update_next_day = False
            next_ghost_dt = datetime.strptime(
                next_ghost, "%Y-%m-%d %H:%M:%S") + timedelta(minutes=project_to_update.logout_buffer) + timedelta(minutes=5)
            conn.execute(
                update(tk_campaigns_table).where(
                    tk_campaigns_table.c.campaign_id == campaign_id
                ).values(
                    starting_hours=request.json['new_starting_hours'],
                    ending_hours=request.json['new_ending_hours'],
                    next_ghost_creation=next_ghost_dt if create_ghosts else None,
                    ending_next_day=update_next_day,
                    edited_by=request.json['edited_by']
                )
            )
        create_or_ignore_user(request.json['users'], False)
        create_or_ignore_user(request.json['coordinators'], True)
        create_or_ignore_status(request.json['statuses'])
        delete_user(request.json['deleted_users'])
        delete_user(request.json['deleted_coordinators'])
        delete_status(request.json['deleted_statuses'])
    return text(f"Project updated. Ip: {request_ip}")


@project.post('/api/delete_project')
@protected
async def delete_project(request):
    project = request.json.get('project')

    def delete_query(table):
        query = delete(
            table
        ).where(
            table.c.campaign_id == project
        )
        return query
    with engine.begin() as conn:
        conn.execute(delete_query(tk_campaigns_table))
        conn.execute(delete_query(tk_user_campaign_table))
        conn.execute(delete_query(tk_campaign_statuses_table))
    return text("Project deleted!")


def union_query_for_not_working_users(table_name):
    query = select(tk_users_table.c.login,
                   tk_users_table.c.name,
                   tk_users_table.c.last_name).select_from(tk_users_table).join(
        table_name, tk_users_table.c.login == table_name.c.login, isouter=True
    )
    return query


def query_for_working_users():
    query = select(
        tk_current_work_table.c.work_stage,
        tk_current_work_table.c.work_stage_additional_info,
        cast(tk_current_work_table.c.work_stage_started, Time),
        tk_current_work_table.c.campaign_name.label('current_campaign_name'),
        cast(tk_current_work_table.c.work_time_started, Time),
        tk_users_table.c.login,
        # tk_users_table.c.koordynator,
        # tk_users_table.c.project_owner,
        tk_users_table.c.name,
        tk_users_table.c.last_name,
    ).select_from(tk_current_work_table).join(
        tk_users_table, tk_current_work_table.c.user_id == tk_users_table.c.login, isouter=True
    )
    return query


def not_working_query(user_list, login, access):

    if access == 'project_owner':
        subquery = select(tk_campaigns_table.c.campaign_id).select_from(
            tk_campaigns_table
        ).join(
            tk_projects_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id
        ).join(
            tk_project_owner_table, tk_project_owner_table.c.project_code == tk_projects_table.c.project_code
        ).where(
            tk_project_owner_table.c.login == login
        )
    else:
        subquery = select(tk_user_campaign_table.c.campaign_id).where(
            tk_user_campaign_table.c.login == login
        )
    # users_query = union_query_for_not_working_users(tk_user_campaign_table).where(
    #     tk_users_table.c.active == True).where(
    #     tk_user_campaign_table.c.login.not_in(user_list)
    # ).where(
    #     tk_user_campaign_table.c.campaign_id.in_(subquery)
    # )
    query = select(tk_users_table.c.login,
                   tk_users_table.c.name,
                   tk_users_table.c.last_name).select_from(tk_users_table).join(
        tk_user_campaign_table, tk_users_table.c.login == tk_user_campaign_table.c.login, isouter=True
    ).where(
        tk_users_table.c.active == True
    ).where(
        tk_user_campaign_table.c.campaign_id.in_(subquery)
    ).where(
        tk_users_table.c.project_owner == False
    ).where(
        tk_user_campaign_table.c.login.not_in(user_list)
    ).where(
        tk_users_table.c.login != login
    )

    # union_query = union_all(users_query, coordinators_query)
    return query


def get_work_status(access_level, login):
    with engine.begin() as conn:
        if access_level == 'admin':
            working_users_query = query_for_working_users().where(
                tk_users_table.c.active == True)
            get_working_users_data = conn.execute(
                working_users_query).fetchall()
            users = [user._mapping['login']
                     for user in get_working_users_data]
            not_working_users_query = select(
                tk_users_table.c.login,
                tk_users_table.c.name,
                tk_users_table.c.last_name
            ).where(
                tk_users_table.c.login.not_in(users)
            ).where(
                tk_users_table.c.login != login
            ).where(
                tk_users_table.c.admin == False
            ).where(
                tk_users_table.c.project_owner == False
            )
            get_not_working_users_data = conn.execute(
                not_working_users_query).fetchall()

            get_not_working_users_data = [dict(data) for data in {tuple(
                user.items()) for user in get_not_working_users_data}]
        elif access_level == 'project_owner':
            # subquery = select(tk_campaigns_table.c.campaign_id).select_from(
            #     tk_campaigns_table
            # ).join(
            #     tk_projects_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id
            # ).join(
            #     tk_project_owner_table, tk_project_owner_table.c.project_code == tk_projects_table.c.project_code
            # ).where(
            #     tk_project_owner_table.c.login == user
            # )
            owner_projects = select(tk_campaigns_table.c.campaign_id).select_from(
                tk_campaigns_table
            ).join(
                tk_projects_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id
            ).join(
                tk_project_owner_table, tk_project_owner_table.c.project_code == tk_projects_table.c.project_code
            ).where(
                tk_project_owner_table.c.login == login
            ).where(
                tk_current_work_table.c.user_id != login
            )
            working_users_query = query_for_working_users().where(
                tk_users_table.c.active == True
            ).where(
                tk_current_work_table.c.campaign_id.in_(owner_projects)
            ).where(
                tk_current_work_table.c.user_id != login
            )
            get_working_users_data = conn.execute(
                working_users_query).fetchall()
            users = [user._mapping['login'] for user in get_working_users_data]
            get_not_working_users_data = conn.execute(
                not_working_query(users, login, access_level)).fetchall()
            get_not_working_users_data = [dict(data) for data in {tuple(
                user.items()) for user in get_not_working_users_data}]
        elif access_level == 'koordynator':
            coordinator_projects = select(tk_user_campaign_table.c.campaign_id).where(
                tk_user_campaign_table.c.login == login
            ).where(
                tk_current_work_table.c.user_id != login
            )
            working_users_query = query_for_working_users().where(
                tk_users_table.c.active == True
            ).where(
                tk_current_work_table.c.campaign_id.in_(coordinator_projects)
            ).where(
                tk_current_work_table.c.user_id != login
            )
            get_working_users_data = conn.execute(
                working_users_query).fetchall()
            users = [user._mapping['login'] for user in get_working_users_data]
            get_not_working_users_data = conn.execute(
                not_working_query(users, login, access_level)).fetchall()
            get_not_working_users_data = [dict(data) for data in {tuple(
                user.items()) for user in get_not_working_users_data}]
        else:
            get_working_users_data = []
    return {
        'working_users': get_working_users_data,
        'not_working_users': get_not_working_users_data
    }


@project.get('/api/get_work_status/<user>')
@protected
async def get_working_users(request, user):
    access_level = check_access(user)
    response = {}
    users = get_work_status(access_level, user)
    response['working_users'] = json.dumps(
            [dict(user._mapping) for user in users['working_users']], default=str, ensure_ascii=False)
    response['not_working_users'] = json.dumps(
        users['not_working_users'], default=str, ensure_ascii=False)
    return sanic_json(response)
# Ścieżka odpowiadająca za pobranie danych projektu po loginie użytkownika wysyłającego zapytanie
# W zależności od poziomu uprawnień użytkownika zwracane są różne dane
# Poziom uprawnień: admin, koordynator, project_owner, user
# Poziom uprawnień sprawdzany jest w funkcji check_access


# Funkcja odpowiadająca za sprawdzenie w tabeli użytkowników poziomu dostępu użytkownika
def check_access(logged_user):
    with engine.begin() as conn:
        query = select(
            tk_users_table.c.admin,
            tk_users_table.c.koordynator,
            tk_users_table.c.project_owner
        ).where(tk_users_table.c.login == logged_user)
        check_user_credentials = conn.execute(query).first()
        if check_user_credentials.admin:
            return "admin"
        elif check_user_credentials.project_owner:
            return "project_owner"
        elif check_user_credentials.koordynator:
            return "koordynator"
        else:
            return "user"

# Funkcja do wyszukiwania poszczególnych danych na temat projektu z dwóch różnych tabel
# W zależności od nazwy tabeli podanej jako argument kwerenda wyszukuje dane z odpowiedniej tabeli
# Funcja jest używana w funkcji get_projects
# Dzięki temu nie trzeba dwukrotnie pisać tej samej, długiej, kwerendy tylko wystarczy podać nazwę tabeli


# def union_query_for_projects(table_name):
#     query = select(
#         tk_campaigns_table.c.campaign_id,
#         tk_campaigns_table.c.campaign_name,
#         tk_campaigns_table.c.starting_hours,
#         tk_campaigns_table.c.ending_hours,
#         tk_campaigns_table.c.logout_buffer,
#         tk_campaigns_table.c.ending_next_day,
#         tk_users_table.c.login,
#         tk_users_table.c.koordynator,
#         tk_users_table.c.project_owner,
#         tk_users_table.c.name,
#         tk_users_table.c.last_name,
#         tk_users_table.c.active,
#     ).select_from(tk_campaigns_table).join(
#         table_name, tk_campaigns_table.c.campaign_id == table_name.c.campaign_id, isouter=True
#     ).join(
#         tk_users_table, table_name.c.login == tk_users_table.c.login, isouter=True
#     )
#     # .join(
#     #     tk_current_work_table, tk_users_table.c.login == tk_current_work_table.c.user_id, isouter=True
#     # )
#     return query


# def union_query_for_admin():
#     query = select(
#         None,
#         None,
#         None,
#         None,
#         None,
#         None,
#         tk_users_table.c.login,
#         tk_users_table.c.koordynator,
#         tk_users_table.c.project_owner,
#         tk_users_table.c.name,
#         tk_users_table.c.last_name,
#         tk_users_table.c.active,
#         # None,
#         # None,
#         # None,
#         # None,
#         # None,
#     ).select_from(tk_users_table).join(
#         tk_user_campaign_table, tk_users_table.c.login == tk_user_campaign_table.c.login, isouter=True
#     ).join(
#         tk_project_owner_table, tk_users_table.c.login == tk_project_owner_table.c.login, isouter=True
#     ).where(
#         tk_user_campaign_table.c.login == None,
#         tk_project_owner_table.c.login == None
#     )
#     return query

@project.get('/api/get_projects/<user>')
@protected
async def index(request, user):
    access_level = check_access(user)
    response = {}
    projects = get_projects(access_level, user)
    detailed_projects = []
    for project in projects:
        detailed_projects.append(get_project_details(
            project.client_name,
            project.project_name,
            project.project_code,
            project.campaign_name,
            project.campaign_id,
            project.starting_hours,
            project.ending_hours,
            project.logout_buffer,
            project.ending_next_day,
            access_level,
            user,
        ))

    # response['projects'] = json.dumps(
    #     detailed_projects, default=str, ensure_ascii=False)

    response['projects'] = json.dumps(
        group_projects(detailed_projects), default=str, ensure_ascii=False)
    statuses = {}
    for project in projects:
        statuses[project.campaign_id] = get_project_statuses(
            project.campaign_id)
    response['statuses'] = json.dumps(statuses)
    return sanic_json(response)


def group_projects(projects):

    def assign_owners(code):
        query = select(tk_project_owner_table.c.login,
                       (tk_users_table.c.name + " " +
                        tk_users_table.c.last_name).label("full_name")
                       ).select_from(
            tk_project_owner_table
        ).join(
            tk_users_table, tk_users_table.c.login == tk_project_owner_table.c.login, isouter=True
        ).where(
            tk_project_owner_table.c.project_code == code
        ).where(
            tk_users_table.c.active == True
        )
        return query
    client_dict = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

    for item in projects:
        client_dict[item['client']][item['project']
                                    ]['project_code'] = item['project_code']
        client_dict[item['client']][item['project']]['campaigns'].append({
            'campaign_name': item['campaign_name'],
            'campaign_id': item['campaign_id'],
            'starting_hours': item['starting_hours'],
            'ending_hours': item['ending_hours'],
            'users': item['users'],
            'coordinators': item['coordinators'],
            'statuses': item['statuses'],
            'logout_buffer': item['logout_buffer'],
            'ending_next_day': item['ending_next_day']
        })

    new_data = []

    for client, projects in client_dict.items():
        client_data = {
            'client': client,
            'projects': []
        }
        for project, data in projects.items():
            with engine.begin() as conn:
                owners = conn.execute(assign_owners(
                    data['project_code'])).fetchall()
            project_data = {
                'name': project,
                'owners': [{
                    'login': owner.login,
                    'full_name': owner.full_name
                } for owner in owners],
                'project_code': data['project_code'],
                'campaigns': data['campaigns']
            }
            client_data['projects'].append(project_data)
        new_data.append(client_data)
    return new_data


def get_project_statuses(id):
    query = select(tk_campaign_statuses_table.c.campaign_status).where(
        tk_campaign_statuses_table.c.campaign_id == id
    )
    with engine.begin() as conn:
        statuses = conn.execute(query)
    statuses_list = [status.campaign_status for status in statuses]
    return statuses_list


# Funkcja pomocnicza zbierająca główne dane dotyczące poszczególnych projektów i przypisanych do nich użytkowników
# Korzysta z funkcji pomocniczej get_union_query_for_projects, ale w zależności od poziomu dostępu ma dodane dodatkowe parametry
# Funkcja jest używana w funkcji głównej index jako jedno z dwóch głównych zapytań do bazy danych


def get_projects(access_level, login):
    def get_project_data():
        query = select(
            tk_clients_table.c.client_name,
            tk_projects_table.c.project_name,
            tk_projects_table.c.project_code,
            tk_campaigns_table.c.campaign_id,
            tk_campaigns_table.c.campaign_name,
            tk_campaigns_table.c.starting_hours,
            tk_campaigns_table.c.ending_hours,
            tk_campaigns_table.c.logout_buffer,
            tk_campaigns_table.c.ending_next_day,
        ).select_from(tk_campaigns_table).join(
            tk_projects_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id, isouter=True
        ).join(tk_clients_table, tk_projects_table.c.client_id == tk_clients_table.c.id)
        return query

    if access_level == 'admin':
        # user_query = union_query_for_projects(tk_user_campaign_table)
        # coordinator_query = union_query_for_projects(
        #     tk_project_owner_table)
        # admin_query = union_query_for_admin()
        # union_query = union_all(user_query, coordinator_query, admin_query)
        # get_project_data = conn.execute(union_query).fetchall()

        # project_data = get_project_data().where(tk_clients_table.c.id == 0)
        project_data = get_project_data()

        #     select(
        #     tk_projects_table.c.project_name,
        #     tk_campaigns_table.c.campaign_id,
        #     tk_campaigns_table.c.campaign_name,
        #     tk_campaigns_table.c.starting_hours,
        #     tk_campaigns_table.c.ending_hours
        # ).select_from(tk_campaigns_table).join(
        #     tk_projects_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id, isouter=True
        # ).where(
        #     tk_projects_table.c.is_active == True
        # )
    elif access_level == 'project_owner':
        project_data = get_project_data().join(
            tk_project_owner_table,
            tk_project_owner_table.c.project_code == tk_projects_table.c.project_code, isouter=True
        ).where(
            tk_project_owner_table.c.login == login
        )
    else:
        # coordinator_projects = select(
        #     tk_projects_table.c.project_name,
        #     tk_campaigns_table.c.campaign_id,
        #     tk_campaigns_table.c.campaign_name,
        #     tk_campaigns_table.c.starting_hours,
        #     tk_campaigns_table.c.ending_hours
        # ).select_from(
        #     tk_user_campaign_table
        # ).join(
        #     tk_campaigns_table,
        #     tk_user_campaign_table.c.campaign_id == tk_campaigns_table.c.campaign_id, isouter=True
        # ).join(
        #     tk_projects_table,
        #     tk_campaigns_table.c.project_id == tk_projects_table.c.id
        # ).where(
        #     tk_user_campaign_table.c.login == login
        # ).where(
        #     tk_projects_table.c.is_active == True
        # )

        project_data = get_project_data().join(
            tk_user_campaign_table,
            tk_user_campaign_table.c.campaign_id == tk_campaigns_table.c.campaign_id, isouter=True
        ).where(
            tk_user_campaign_table.c.login == login
        )
    with engine.begin() as conn:
        get_project_data = conn.execute(
            project_data.where(
                tk_projects_table.c.is_active == True
            )
        ).fetchall()
    # else:
        #     user_query = union_query_for_projects(tk_user_campaign_table).where(
        #         tk_user_campaign_table.c.login == login
        #     )
        #     get_project_data = conn.execute(user_query).fetchall()
    return get_project_data


def get_project_details(client, project, project_code, campaign_name, campaign_id, start, end, logout, ending_next_day, access, login):
    def assign_users(p, coordinator_bool=False):
        query = select(tk_user_campaign_table.c.login,
                       (tk_users_table.c.name + " " +
                        tk_users_table.c.last_name).label("full_name")).select_from(
            tk_user_campaign_table).join(
            tk_users_table, tk_users_table.c.login == tk_user_campaign_table.c.login, isouter=True
        ).where(
            tk_user_campaign_table.c.campaign_id == p
        ).where(
            tk_user_campaign_table.c.koordynator == coordinator_bool
        ).where(
            tk_users_table.c.active == True,
            tk_users_table.c.login != login
        )
        # .where(
        #     tk_users_table.c.login != login
        # )
        return query

    def assign_statuses(campaign_id):
        query = select(tk_campaign_statuses_table.c.campaign_status).where(
            tk_campaign_statuses_table.c.campaign_id == campaign_id
        )
        return query
    # projects = request.json.get('projects')
    campaigns = {}
    campaigns['client'] = client
    campaigns['project'] = project
    campaigns['project_code'] = project_code
    campaigns['campaign_name'] = campaign_name
    campaigns['campaign_id'] = campaign_id
    campaigns['starting_hours'] = start
    campaigns['ending_hours'] = end
    campaigns['logout_buffer'] = logout
    campaigns['ending_next_day'] = ending_next_day
    with engine.begin() as conn:
        if access != 'user':
            campaigns['users'] = [
                {'login': user.login,
                    'full_name': user.full_name if user.full_name else 'N/A'}
                for user in conn.execute(
                    assign_users(
                        campaign_id,
                    )
                ).fetchall()
            ]
            campaigns['coordinators'] = [
                {'login': user.login,
                    'full_name': user.full_name if user.full_name else 'N/A'}
                for user in conn.execute(
                    assign_users(
                        campaign_id,
                        True
                    )
                ).fetchall()
            ]
            campaigns['statuses'] = [
                status.campaign_status for status in conn.execute(assign_statuses(campaign_id)).fetchall()
            ]
        else:
            campaigns['users'] = []
            campaigns['coordinators'] = []
            campaigns['statuses'] = [
                status.campaign_status for status in conn.execute(assign_statuses(campaign_id)).fetchall()
            ]

    return campaigns


# @project.post('/api/handle_coordinators')
# def handle_coordinators(request):
#     query = select(tk_project_owner_table.c.login,
#                    tk_project_owner_table.c.campaign_id,
#                    tk_users_table.c.koordynator,
#                    tk_users_table.c.project_owner
#                    ).select_from(tk_project_owner_table).join(
#         tk_users_table, tk_users_table.c.login == tk_project_owner_table.c.login
#     )

#     def transfer_coordinators(record):
#         with engine.begin() as conn:
#             conn.execute(insert(tk_user_campaign_table).values(
#                 login=record.login,
#                 campaign_id=record.campaign_id,
#                 koordynator=record.koordynator,
#                 project_owner=record.project_owner
#             ))

#     with engine.begin() as conn:
#         result = conn.execute(query).fetchall()
#     for each in result:
#         transfer_coordinators(each)
#     return text('elo')


@project.get('/api/get_project_creation_data')
def get_project_creation_data(request):
    user_query = select(
        tk_users_table.c.login,
        (tk_users_table.c.name+" " +
         tk_users_table.c.last_name).label("full_name")
    )
    project_query = select(
        tk_projects_table.c.project_name
    ).where(
        tk_projects_table.c.is_active == True
    )

    user_dict = {}
    with engine.begin() as conn:
        users = conn.execute(user_query.where(
            tk_users_table.c.koordynator == False
        ).where(
            tk_users_table.c.project_owner == False
        ).where(
            tk_users_table.c.admin == False
        )
        ).fetchall()
        coordinators = conn.execute(user_query.where(
            tk_users_table.c.koordynator == True).where(
            tk_users_table.c.project_owner == False
        )
        ).fetchall()
        p_o = conn.execute(user_query.where(
            tk_users_table.c.koordynator == True).where(
            tk_users_table.c.project_owner == True
        )
        ).fetchall()
        projects = conn.execute(project_query).fetchall()
        # projects = dict.fromkeys(projects)
        projects = [project.project_name for project in projects]
        users = list(dict.fromkeys(users))
        coordinators = list(dict.fromkeys(coordinators))
        p_o = list(dict.fromkeys(p_o))
    user_dict['users'] = [{
        'login': user.login,
        'full_name': user.full_name
    } for user in users]
    user_dict['coordinators'] = [{
        'login': coordinator.login,
        'full_name': coordinator.full_name
    } for coordinator in coordinators]
    user_dict['project_owners'] = [{
        'login': project_owner.login,
        'full_name': project_owner.full_name
    } for project_owner in p_o]
    response = {
        'users': user_dict,
        'projects': projects
    }
    return sanic_json(json.dumps(response, ensure_ascii=False))

# @project.post("/upload_clients")
# def upload_clients(request):
#     DATA = []
#     with engine.begin() as conn:
#       for each in DATA:
#           id_query = conn.execute(select(tk_clients_table.c.id).where(
#               tk_clients_table.c.client_name == each['client']
#           )).first()
#           conn.execute(insert(tk_projects_table).values(
#               id = each['id'],
#               client_id = id_query.id,
#               project_name = each['name'],
#               project_code = each['project_code'],
#               is_active = True if each['status'] == 'Aktywny' else False
#           ))
#     return text('Projects added')
