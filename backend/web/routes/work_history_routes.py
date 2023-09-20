import json
import pytz
# import pandas as pd
# import os
# from dotenv import load_dotenv
from datetime import date, datetime, timedelta
from sanic import Blueprint
from sanic.response import json as sanic_json, text
from sqlalchemy import select, asc, and_, func, insert, delete, update, cast, Date
from web.routes.counter_routes import find_client
from web.db_connection import (
    engine,
    tk_finished_work_table,
    tk_users_table,
    tk_deleted_records_table,
    tk_campaigns_table,
    # tk_project_owner_table,
    tk_user_campaign_table,
    tk_projects_table
    # tk_campaign_statuses_table
)
from web.auth import protected

history = Blueprint('history')
local_tz = pytz.timezone('Europe/Warsaw')
time_format = "%Y-%m-%d %H:%M:%S"


@history.post('/api/get_project_history')
@protected
async def get_project_history(request):
    response = {}
    get_all = request.json.get('get_all')
    user_id = request.json.get('user_id')
    start_date = request.json.get('start_date')
    end_date = request.json.get('end_date')
    selected_projects = request.json.get('selected_projects')
    user_query = select(
        tk_users_table.c.admin
    ).where(
        tk_users_table.c.login == user_id
    )

    def basic_history_query():
        query = select(
            tk_finished_work_table.c.user_id,
            tk_finished_work_table.c.work_stage_id,
            tk_finished_work_table.c.work_stage,
            tk_finished_work_table.c.work_stage_additional_info,
            tk_finished_work_table.c.campaign_name,
            tk_finished_work_table.c.campaign_id,
            tk_finished_work_table.c.comments,
            tk_finished_work_table.c.work_stage_started,
            tk_finished_work_table.c.work_stage_ended,
            tk_finished_work_table.c.work_stage_duration,
            tk_finished_work_table.c.auto_logout,
            tk_projects_table.c.project_name,
            tk_projects_table.c.project_code,
            tk_users_table.c.koordynator,
            (tk_users_table.c.name + " " +
             tk_users_table.c.last_name).label("full_name"),
            cast(tk_finished_work_table.c.work_time_started,
                 Date).label("full_date")

        ).select_from(tk_finished_work_table).join(
            tk_users_table, tk_users_table.c.login == tk_finished_work_table.c.user_id
        ).join(
            tk_campaigns_table, tk_finished_work_table.c.campaign_id == tk_campaigns_table.c.campaign_id
        ).join(
            tk_projects_table, tk_projects_table.c.id == tk_campaigns_table.c.project_id
        ).where(
            and_(func.date(tk_finished_work_table.c.work_stage_ended) >= start_date,
                 func.date(
                     tk_finished_work_table.c.work_stage_ended) <= end_date,
                 tk_finished_work_table.c.is_ghost == False
                 )
        ).order_by(
            tk_finished_work_table.c.campaign_id,
            tk_users_table.c.last_name,
            asc(tk_finished_work_table.c.work_stage_ended)
        )
        return query


    def coordinator_history_query():
        query = basic_history_query().join(
            tk_user_campaign_table, tk_user_campaign_table.c.campaign_id == tk_campaigns_table.c.campaign_id
        ).where(
            tk_user_campaign_table.c.login == user_id
        )
        return query

    def selected_projects_history_query():
        query = basic_history_query().where(
            tk_finished_work_table.c.campaign_id.in_(selected_projects)
        )
        return query

    with engine.begin() as conn:
        is_admin = conn.execute(user_query).first()
        if get_all:
            if is_admin[0]:
                history = conn.execute(basic_history_query())
                response['project_history'] = json.dumps(
                    [dict(work_stage._mapping) for work_stage in history], default=str, ensure_ascii=False)
                return sanic_json(response)
            else:
                history = conn.execute(coordinator_history_query())
                response['project_history'] = json.dumps(
                    [dict(work_stage._mapping) for work_stage in history], default=str, ensure_ascii=False)
                return sanic_json(response)
        else:
            history = conn.execute(selected_projects_history_query())
            response['project_history'] = json.dumps(
                    [dict(work_stage._mapping) for work_stage in history], default=str, ensure_ascii=False)
            return sanic_json(response)

# Ścieżka do sprawdzania historii użytkownika na podstawie loginu i dat przekazanych w requeście

def work_history_query(start_date, end_date, user):
    query = select(
        tk_finished_work_table.c.work_stage_id,
        tk_finished_work_table.c.user_id,
        tk_finished_work_table.c.work_stage_started,
        tk_finished_work_table.c.work_stage_ended,
        tk_finished_work_table.c.work_stage_duration,
        tk_finished_work_table.c.work_stage,
        tk_finished_work_table.c.work_stage_additional_info,
        tk_finished_work_table.c.work_time_ended,
        tk_finished_work_table.c.work_time_started,
        tk_finished_work_table.c.campaign_name,
        tk_finished_work_table.c.campaign_id,
        tk_finished_work_table.c.comments,
        tk_finished_work_table.c.auto_logout,
        tk_finished_work_table.c.update_case,
        tk_projects_table.c.project_code,
        tk_projects_table.c.project_name,
        tk_users_table.c.koordynator
    ).select_from(
        tk_finished_work_table
    ).join(
        tk_campaigns_table, tk_campaigns_table.c.campaign_id == tk_finished_work_table.c.campaign_id
    ).join(
        tk_projects_table, tk_projects_table.c.id == tk_campaigns_table.c.project_id
    ).join(
        tk_users_table, tk_finished_work_table.c.user_id == tk_users_table.c.login
    ).where(
        and_(func.date(tk_finished_work_table.c.work_stage_ended) >= start_date,
             func.date(tk_finished_work_table.c.work_stage_ended) <= end_date,
             tk_finished_work_table.c.user_id == user,
             tk_finished_work_table.c.is_ghost == False
             )
    ).order_by(asc(tk_finished_work_table.c.work_stage_ended))
    return query

@ history.post('/api/get_work_history')
@protected
async def get_work_history(request):
    response = {}
    today = date.today()
    user = request.json.get('user_id')
    start_date = request.json.get('start_date')
    end_date = request.json.get('end_date')


    today_query = select(tk_finished_work_table).where(
        and_(
            tk_finished_work_table.c.work_time_ended.is_not(None),
            tk_finished_work_table.c.work_time_started.like(f"%{today}%"),
            tk_finished_work_table.c.user_id == user
        )
    )
    with engine.begin() as conn:
        work_history = conn.execute(work_history_query(start_date, end_date, user))
        present_work = conn.execute(today_query)

    response['work_history'] = json.dumps(
            [dict(work_stage._mapping) for work_stage in work_history], default=str, ensure_ascii=False)

    response['work_history_for_today'] = json.dumps(
            [dict(work_stage._mapping) for work_stage in present_work], default=str, ensure_ascii=False)

    return sanic_json(response)


def manage_scheduled_time(date_arg, time_arg, buffer=0):
    date_to_datetime = datetime.strptime(date_arg, "%Y-%m-%d")
    work_time = datetime.strptime(time_arg, "%H:%M")
    time = work_time.time()
    added_hours = date_to_datetime + \
        timedelta(hours=time.hour, minutes=time.minute,
                  seconds=time.second) + timedelta(minutes=buffer)
    return added_hours


def create_history_records(selected_date, record, editor):
    with engine.begin() as conn:
        project_details = conn.execute(
            select(
                tk_campaigns_table.c.campaign_id,
                tk_campaigns_table.c.campaign_name,
                tk_campaigns_table.c.starting_hours,
                tk_campaigns_table.c.ending_hours,
                tk_campaigns_table.c.logout_buffer
            ).where(
                tk_campaigns_table.c.campaign_id == record['project']
            )
        ).first()
        scheduled_start_time = manage_scheduled_time(
            selected_date, project_details.starting_hours)
        scheduled_end_time = manage_scheduled_time(
            selected_date, project_details.ending_hours, int(project_details.logout_buffer))
        client = conn.execute(find_client(record['project'])).first()
        conn.execute(
            insert(tk_finished_work_table).values(
                user_id=record['login'],
                work_stage_id=record['workStageId'],
                campaign_id=record['project'],
                campaign_name=project_details.campaign_name,
                project_name=client.client_name,
                work_stage=record['workStage'],
                work_stage_additional_info=record['additionalInfo'],
                comments=record['comments'],
                work_stage_started=record['workStageStarted'],
                work_stage_ended=record['workStageEnded'],
                work_stage_duration=record['duration'],
                scheduled_start_time=scheduled_start_time,
                scheduled_end_time=scheduled_end_time,
                update_case=record['workCase'],
                update_reason='Record updated manually',
                edited_by=editor,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        )


def copy_and_delete_records(id, editor, edit_reason):
    with engine.begin() as conn:
        record = conn.execute(
            select(tk_finished_work_table).where(
                tk_finished_work_table.c.work_stage_id == id
            )
        ).first()
        if record:
            conn.execute(
                insert(tk_deleted_records_table).values(
                    work_stage_id=record.work_stage_id,
                    user_id=record.user_id,
                    campaign_id=record.campaign_id,
                    campaign_name=record.campaign_name,
                    project_name=record.project_name,
                    work_stage=record.work_stage,
                    work_stage_additional_info=record.work_stage_additional_info,
                    comments=record.comments,
                    work_stage_started=record.work_stage_started,
                    work_stage_ended=record.work_stage_ended,
                    work_stage_duration=record.work_stage_duration,
                    work_time_started=record.work_time_started,
                    scheduled_start_time=record.scheduled_start_time,
                    work_time_ended=record.work_time_ended,
                    scheduled_end_time=record.scheduled_end_time,
                    auto_logout=record.auto_logout,
                    edited_by=editor,
                    time_of_update=datetime.now(
                        tz=local_tz).strftime(f"{time_format}"),
                    reason=edit_reason
                )
            )
            conn.execute(
                delete(tk_finished_work_table).where(
                    tk_finished_work_table.c.work_stage_id == id
                )
            )


def declare_work_stage_times(user_id, date, start=True):
    if start:
        select_query = select(func.min(
            tk_finished_work_table.c.work_stage_started
        )).where(
            and_(
                tk_finished_work_table.c.user_id == user_id,
                tk_finished_work_table.c.work_stage_started.like(f"%{date}%")
            )
        )
    else:
        select_query = select(func.max(
            tk_finished_work_table.c.work_stage_ended
        )).where(
            and_(
                tk_finished_work_table.c.user_id == user_id,
                tk_finished_work_table.c.work_stage_ended.like(f"%{date}%")
            )
        )
    with engine.begin() as conn:
        query_result = conn.execute(select_query).first()
    return query_result[0]


@ history.post('/api/delete_time')
@protected
async def delete_time(request):
    record_id = request.json.get('work_stage_id')
    editor = request.json.get('editedBy')
    copy_and_delete_records(record_id, editor, 'Delete request')
    return text('Record was deleted')


@ history.post('/api/update_work_history')
@protected
async def update_work_history(request):
    records_to_delete = request.json.get('recordsToDelete')
    records_to_create = request.json.get('recordsToCreate')
    user_id = request.json.get('user_id')
    edited_by = request.json.get('editedBy')
    selected_date = request.json.get('selected_date')
    if records_to_delete:
        for record in records_to_delete:
            copy_and_delete_records(record, edited_by, 'Work history update')
    else:
        return_text = "No records to delete"
    if records_to_create:
        for record in records_to_create:
            print(record)
            create_history_records(selected_date, record, edited_by)
    else:
        print("No records to create")

    first_work_stage = declare_work_stage_times(user_id, selected_date)

    latest_work_stage = declare_work_stage_times(user_id, selected_date, False)
    with engine.begin() as conn:
        conn.execute(
            update(tk_finished_work_table).where(
                and_(
                    tk_finished_work_table.c.user_id == user_id,
                    tk_finished_work_table.c.work_stage_ended.like(
                        f"%{selected_date}%")
                )
            ).values(
                work_time_started=first_work_stage,
                work_time_ended=latest_work_stage
            )
        )

    return sanic_json({
        "first": str(first_work_stage),
        "latest": str(latest_work_stage)
    })

# now = datetime.now(tz=local_tz)
# now_to_str = now.strftime("%Y-%m-%d-%H-%M-%S")
# backup_year = str(now.year)
# backup_month = now.strftime("%B")
# backup_directory = f"web/backups/{backup_year}/{backup_month}"


# @history.get('/api/backup')
# def backup_db(request):

#     def backup_daily(table_name):

#         print(backup_year)
#         print(backup_month)
#         query = select(table_name)

#         if not os.path.exists(backup_directory):
#             os.makedirs(backup_directory)
#         with engine.begin() as conn:
#             backup = conn.execute(query)
#         df = pd.DataFrame(data=backup)
#         file_name = now_to_str + f'_{table_name}_backup'
#         return_csv = f"{backup_directory}/{file_name}.csv"
#         df.to_csv(return_csv, sep=",", index=False)

#     def backup_bi_weekly():
#         tables = [tk_users_table, tk_campaigns_table, tk_project_owner_table,
#                   tk_user_campaign_table, tk_campaign_statuses_table]
#         for table in tables:
#             query = select(table)
#             if not os.path.exists(backup_directory):
#                 os.makedirs(backup_directory)
#             with engine.begin() as conn:
#                 backup = conn.execute(query)
#                 df = pd.DataFrame(data=backup)
#                 file_name = now_to_str + f'_{table}_backup'
#                 return_csv = f"{backup_directory}/{file_name}.csv"
#                 df.to_csv(return_csv, sep=",", index=False)
#     backup_bi_weekly()
#     return text('Backup completed')
