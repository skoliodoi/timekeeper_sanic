import pandas as pd
import os
import pytz
from datetime import datetime, timedelta
from sqlalchemy import select, union_all, insert, update
from web.routes.counter_routes import move_from_current_work
from web.db_connection import (
    engine,
    tk_users_table,
    tk_campaigns_table,
    tk_current_work_table,
    tk_user_campaign_table,
    tk_project_owner_table,
    tk_finished_work_table,
    tk_campaign_statuses_table
)

local_tz = pytz.timezone('Europe/Warsaw')

def search_for_ghost_projects():
    # today = date.today()
    # tomorrow = date.today() + timedelta(days=1)
    now = datetime.now(tz=local_tz)
    # current_hours = now.strftime('%H:%M')
    query = select(
        tk_campaigns_table
    ).where(
        tk_campaigns_table.c.next_ghost_creation < now
    ).where(
        tk_campaigns_table.c.next_ghost_creation != None
    )
    with engine.begin() as conn:
        projects = conn.execute(query)
    for project in projects:
        current_ghost_creation_date = project.next_ghost_creation.date()
        next_ghost_creation = project.next_ghost_creation + timedelta(days=1)
        scheduled_start = f'{current_ghost_creation_date} {project.starting_hours}'
        scheduled_end = f'{current_ghost_creation_date} {project.ending_hours}'
        with engine.begin() as inner_con:
            ghosts_to_create = inner_con.execute(
                search_query_for_ghosts(current_ghost_creation_date, project.campaign_id))
            for ghost in ghosts_to_create:
                insert_ghost = insert_query_for_ghosts(ghost.login,
                                                       campaign_id=project.campaign_id,
                                                       campaign_name=project.campaign_name,
                                                       date=current_ghost_creation_date,
                                                       scheduled_start=scheduled_start,
                                                       scheduled_end=scheduled_end)
                with engine.begin() as insert_ghost_conn:
                    insert_ghost_conn.execute(insert_ghost)
            update_projects_ghosts(project, next_ghost_creation)


def update_projects_ghosts(project, date):
    update_project_query = update(tk_campaigns_table).values(
        next_ghost_creation=date
    ).where(
        tk_campaigns_table.c.campaign_id == project.campaign_id
    )
    with engine.begin() as project_conn:
        project_conn.execute(update_project_query)


def union_query_for_ghosts(table_name, campaign_id):
    query = select(
        table_name.c.login
    ).where(
        table_name.c.campaign_id == campaign_id
    )
    return query


def search_query_for_ghosts(yesterday, project):
    query = select(
        tk_users_table.c.login
    ).where(
        tk_users_table.c.login.not_in(
            select(
                tk_finished_work_table.c.user_id
            ).where(
                tk_finished_work_table.c.campaign_id == project
            ).where(
                tk_finished_work_table.c.work_time_ended.like(f"%{yesterday}%")
            )
        )
    ).where(
        tk_users_table.c.login.in_(
            union_all(
                union_query_for_ghosts(tk_user_campaign_table, project),
                # union_query_for_ghosts(tk_project_owner_table, project)
            )
        )
    ).where(
        tk_users_table.c.active == True
    ).where(
        tk_users_table.c.project_owner == False
    )
    return query


def insert_query_for_ghosts(login, campaign_name, campaign_id, date, scheduled_start, scheduled_end):
    query = insert(
        tk_finished_work_table
    ).values(
        user_id=login,
        work_stage_id='sp00kyGh0st_b0000',
        campaign_name=campaign_name,
        campaign_id=campaign_id,
        work_stage_started=f'{date} 00:00:00',
        work_stage_ended=f'{date} 00:00:00',
        work_time_started=f'{date} 00:00:00',
        work_time_ended=f'{date} 00:00:00',
        work_stage_duration='0',
        scheduled_start_time=f'{scheduled_start}:00',
        scheduled_end_time=f'{scheduled_end}:00',
        is_ghost=True,
        edited_by='Automat',
        created_at=datetime.now(tz=local_tz),
        updated_at=datetime.now(tz=local_tz),
    )
    return query


# def check_for_ghosts():
#     today = date.today()
#     now = datetime.now(tz=local_tz)
#     time_format = now.strftime('%H:%M')

#     with engine.begin() as conn:
#         ghost_projects = conn.execute(search_for_ghost_projects(time_format))
#         for project in ghost_projects:
#             scheduled_start = f'{today} {project.starting_hours}'
#             scheduled_end = f'{today} {project.ending_hours}'
#             ghosts_to_create = conn.execute(
#                 search_query_for_ghosts(today, project.campaign_id))
#             for each in ghosts_to_create:
#                 insert_ghost = insert_query_for_ghosts(each.login,
#                                                        campaign_id=project.campaign_id,
#                                                        campaign_name=project.campaign_name,
#                                                        date=today,
#                                                        scheduled_start=scheduled_start,
#                                                        scheduled_end=scheduled_end)
#                 conn.execute(insert_ghost)


def check_if_finished():
    query = select(tk_current_work_table).where(
        tk_current_work_table.c.auto_logout_time <= datetime.now(
            tz=local_tz)
    )
    with engine.begin() as conn:
        result = conn.execute(query)
    for each in result:
        move_from_current_work(each)


def backup_tk_finished():
    now = datetime.now(tz=local_tz
                       )
    now_to_str = now.strftime("%Y-%m-%d-%H-%M-%S")
    backup_year = str(now.year)
    backup_month = now.strftime("%B")
    query = select(tk_finished_work_table)
    backup_directory = f"web/backups/{backup_year}/{backup_month}"
    if not os.path.exists(backup_directory):
        os.makedirs(backup_directory)
    with engine.begin() as conn:
        backup = conn.execute(query)
    df = pd.DataFrame(data=backup)
    file_name = now_to_str + '_tk_finished_table_backup'
    return_csv = f"{backup_directory}/{file_name}.csv"
    df.to_csv(return_csv, sep=",", index=False)


def backup_rest():
    now = datetime.now(tz=local_tz
                       )
    now_to_str = now.strftime("%Y-%m-%d-%H-%M-%S")
    backup_year = str(now.year)
    backup_month = now.strftime("%B")
    query = select(tk_finished_work_table)
    backup_directory = f"web/backups/{backup_year}/{backup_month}"
    tables = [tk_users_table, tk_campaigns_table, tk_project_owner_table,
              tk_user_campaign_table, tk_campaign_statuses_table]
    for table in tables:
        query = select(table)
        if not os.path.exists(backup_directory):
            os.makedirs(backup_directory)
        with engine.begin() as conn:
            backup = conn.execute(query)
            df = pd.DataFrame(data=backup)
            file_name = now_to_str + f'_{table}_backup'
            return_csv = f"{backup_directory}/{file_name}.csv"
            df.to_csv(return_csv, sep=",", index=False)
