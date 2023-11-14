from sanic import Blueprint
import json
from sanic.response import json as sanic_json, text
from sanic.exceptions import SanicException
from sqlalchemy import select, insert, delete, asc, and_, func
# from web.routes.work_history_routes import work_history_query
from web.auth import protected
from io import BytesIO
import pandas as pd
import numpy as np
from web.db_connection import (
    engine,
    tk_users_table,
    tk_schedules_table,
    tk_finished_work_table,
    tk_projects_table,
    tk_campaigns_table
)


schedules = Blueprint('schedules')


class ExistingSchedule(SanicException):
    status_code = 409
    message = 'Schedule already in the database'


def insert_schedule(code, date, record, editor):
    query = insert(tk_schedules_table).values(
        project_code=code,
        workday=date,
        user=record['USER'],
        mocarz_id=record['MOCARZ ID'],
        zmiana=record['Zmiana'],
        scheduled_start=record['scheduled_start'],
        scheduled_end=record['scheduled_end'],
        scheduled_duration=record['duration'],
        scheduled_duration_milliseconds=record['duration_in_milliseconds'],
        edited_by=editor,
    )
    return query


def check_existing_schedules(date, project):
    query = select(tk_schedules_table).where(
        tk_schedules_table.c.workday.like(f"%{date}%")
    ).where(
        tk_schedules_table.c.project_code == project
    )
    return query


def clear_existing_schedules(date, project):
    with engine.begin() as conn:
        conn.execute(delete(tk_schedules_table).where(
            tk_schedules_table.c.workday.like(f"%{date}%")
        ).where(
            tk_schedules_table.c.project_code == project
        ))


def get_user_login(mocarz_id):
    with engine.begin() as conn:
        login = conn.execute(select(
            tk_users_table.c.login
        ).where(
            tk_users_table.c.moccarz_id == mocarz_id
        )
        ).first()
    return login.login if login else 'N/A'


@schedules.post('/api/download_schedule')
@protected
async def download_schedule(request):
    query = select(
        tk_schedules_table.c.workday,
        tk_schedules_table.c.user,
        tk_schedules_table.c.mocarz_id,
        tk_schedules_table.c.zmiana,
        tk_schedules_table.c.scheduled_start,
        tk_schedules_table.c.scheduled_end,
        tk_schedules_table.c.scheduled_duration,
        tk_schedules_table.c.scheduled_duration_milliseconds
    ).where(
        tk_schedules_table.c.workday == request.json['date']
    ).where(
        tk_schedules_table.c.project_code == request.json['project']
    )



    def compare_to_history(users):
      with engine.begin() as conn:        
        result = conn.execute(select(
            tk_finished_work_table.c.work_stage_started,
            tk_finished_work_table.c.work_stage_ended,
            tk_finished_work_table.c.work_stage_duration,
            tk_finished_work_table.c.work_stage,
            tk_finished_work_table.c.work_stage_additional_info,
            tk_finished_work_table.c.work_time_ended,
            tk_finished_work_table.c.work_time_started,
            tk_finished_work_table.c.campaign_name,
            tk_finished_work_table.c.campaign_id,
            tk_projects_table.c.project_code,
            tk_projects_table.c.project_name,
            tk_users_table.c.moccarz_id
        ).select_from(
            tk_finished_work_table
        ).join(
            tk_campaigns_table, tk_campaigns_table.c.campaign_id == tk_finished_work_table.c.campaign_id
        ).join(
            tk_projects_table, tk_projects_table.c.id == tk_campaigns_table.c.project_id
        ).join(
            tk_users_table, tk_finished_work_table.c.user_id == tk_users_table.c.login
        ).where(
            and_(func.date(tk_finished_work_table.c.work_stage_ended) >= request.json['date'],
                func.date(tk_finished_work_table.c.work_stage_ended) <= request.json['date'],
                tk_finished_work_table.c.is_ghost == False,
                tk_finished_work_table.c.user_id.in_(users),
                tk_projects_table.c.project_code == request.json['project']
                )
        ).order_by(asc(tk_finished_work_table.c.work_stage_ended))).fetchall()
      return result

    with engine.begin() as conn:
        result = conn.execute(query).fetchall()

    data = [user._mapping for user in result]
    
    transformed_data = []
    for item in data:
        user_name = item['user']
        mocarz_id = item['mocarz_id']
        zmiana_nr = item['zmiana']
        zmiana_details = {
            'scheduled_start': item['scheduled_start'],
            'scheduled_end': item['scheduled_end'],
            'scheduled_duration': item['scheduled_duration'],
            'scheduled_duration_milliseconds': item['scheduled_duration_milliseconds']
        }

        zmiana_dict = {
            'zmiana_nr': zmiana_nr,
            'zmiana_details': zmiana_details
        }

        user_exists = False
        for transformed_item in transformed_data:
            if transformed_item['user_name'] == user_name:
                transformed_item['zmiany'].append(zmiana_dict)
                user_exists = True
                break

        if not user_exists:
            user_dict = {
                'user_name': user_name,
                'mocarz_id': mocarz_id if mocarz_id else 'N/A',
                'zmiany': [zmiana_dict]
            }
            transformed_data.append(user_dict)
    

    def get_logins(ids):
      query = select(tk_users_table.c.login, tk_users_table.c.moccarz_id).where(
          tk_users_table.c.moccarz_id.in_(ids)
      )
      return query

    ids = list(dict.fromkeys([t['mocarz_id'] for t in transformed_data]))
    with engine.begin() as conn:
        result = conn.execute(get_logins(ids)).fetchall()
    logins = list(dict.fromkeys([r.login for r in result]))


    work_history = compare_to_history(logins)
    for person in transformed_data:
      person['work_history'] = []
      for w in work_history:
          if person['mocarz_id'] == w.moccarz_id:
            person['work_history'].append(dict(w._mapping))
    transformed_data_json = json.dumps(
        transformed_data, default=str, ensure_ascii=False)
    return sanic_json(transformed_data_json)


@schedules.post('/api/upload_schedule')
@protected
async def upload_schedule(request):
  try:
    project = request.form.get('project')
    edited_by = request.form.get('edited_by')
    correction = False if request.form.get('correction') == 'false' else True
    file = request.files.get('file')
    file_parameters = {
        'body': file.body,
        'name': file.name,
        'type': file.type,
    }
    body_df = pd.read_csv(BytesIO(file_parameters['body']))
    body_df2 = body_df[(body_df['Grafik suma'] != '0,00') & (body_df['Grafik suma'].notna()) & (
        body_df['Grafik suma'] != 'błąd - brak kompletu danych')].replace({np.nan: None})
    result_dict = body_df2.to_dict('records')
    grouped_data = {}
    for item in result_dict:
        data = item.pop('DATA')  # Remove 'DATA' key and get its value

        # Convert 'Grafik start', 'Grafik stop', and 'Grafik suma' to hh:mm:ss format
        start_time = float(item['Grafik start'].replace(',', '.'))
        start_hours = int(start_time)
        start_minutes = int((start_time % 1) * 60)
        start_seconds = int(((start_time % 1) * 60) % 1 * 60)
        item['scheduled_start'] = "{:02d}:{:02d}:{:02d}".format(
            start_hours, start_minutes, start_seconds)

        stop_time = float(item['Grafik stop'].replace(',', '.'))
        stop_hours = int(stop_time)
        stop_minutes = int((stop_time % 1) * 60)
        stop_seconds = int(((stop_time % 1) * 60) % 1 * 60)
        item['scheduled_end'] = "{:02d}:{:02d}:{:02d}".format(
            stop_hours, stop_minutes, stop_seconds)

        suma_time = float(item['Grafik suma'].replace(',', '.'))
        suma_hours = int(suma_time)
        suma_minutes = int((suma_time % 1) * 60)
        suma_seconds = int(((suma_time % 1) * 60) % 1 * 60)
        item['duration'] = "{:02d}:{:02d}:{:02d}".format(
            suma_hours, suma_minutes, suma_seconds)

        # Calculate duration in milliseconds
        duration_hours = int(suma_hours)
        duration_minutes = int(suma_minutes)
        duration_seconds = int(suma_seconds)
        duration_in_milliseconds = (
            duration_hours * 3600 + duration_minutes * 60 + duration_seconds) * 1000
        item['duration_in_milliseconds'] = duration_in_milliseconds

        if data not in grouped_data:
            grouped_data[data] = []
        grouped_data[data].append(item)

    # for item in result_dict:
    #     data = item.pop('DATA')  # Remove 'DATA' key and get its value

    #     # Convert 'Grafik start', 'Grafik stop', and 'Grafik suma' to hh:mm:ss format
    #     start_parts = item['Grafik start'].replace(',', '.').split('.')
    #     stop_parts = item['Grafik stop'].replace(',', '.').split('.')
    #     suma_parts = item['Grafik suma'].replace(',', '.').split('.')

    #     start_time = float(item['Grafik start'].replace(',', '.'))
    #     start_hours = int(start_time)
    #     start_minutes = int((start_time % 1) * 60)
    #     start_seconds = int(((start_time % 1) * 60) % 1 * 60)
    #     item['Grafik start'] = "{:02d}:{:02d}:{:02d}".format(start_hours, start_minutes, start_seconds)

    #     stop_time = float(item['Grafik stop'].replace(',', '.'))
    #     stop_hours = int(stop_time)
    #     stop_minutes = int((stop_time % 1) * 60)
    #     stop_seconds = int(((stop_time % 1) * 60) % 1 * 60)
    #     item['Grafik stop'] = "{:02d}:{:02d}:{:02d}".format(stop_hours, stop_minutes, stop_seconds)

    #     suma_time = float(item['Grafik suma'].replace(',', '.'))
    #     suma_hours = int(suma_time)
    #     suma_minutes = int((suma_time % 1) * 60)
    #     suma_seconds = int(((suma_time % 1) * 60) % 1 * 60)
    #     item['Grafik suma'] = "{:02d}:{:02d}:{:02d}".format(suma_hours, suma_minutes, suma_seconds)

    #     if data not in grouped_data:
    #         grouped_data[data] = []
    #     grouped_data[data].append(item)
    fragmented_date = list(grouped_data.keys())[0].rsplit('-', 1)[0]
    with engine.begin() as conn:
        find_schedules = conn.execute(
            check_existing_schedules(fragmented_date, project)).first()
        if not find_schedules or correction:
            if correction:
                clear_existing_schedules(fragmented_date, project)
            for key, value in grouped_data.items():
                for each in value:
                    conn.execute(insert_schedule(project, key, each, edited_by))
            return text('File uploaded')
        else:
            raise ExistingSchedule
  except Exception as e:
      raise SanicException(f"Problem z plikiem - {e}", 422)