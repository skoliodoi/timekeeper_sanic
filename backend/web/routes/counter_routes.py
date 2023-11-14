from sanic import Blueprint
from sanic.response import json as sanic_json, text
from sqlalchemy import select, desc, and_, delete, update
from sqlalchemy.dialects.mysql import insert
from datetime import datetime, timedelta
from web.auth import protected
import pytz
from web.db_connection import engine, tk_current_work_table, tk_finished_work_table, tk_clients_table, tk_campaigns_table, tk_projects_table

counter = Blueprint('counter')


# Funkcja check_user sprawdza czy użytkownik ma jakiekolwiek rekordy w tabeli tk_current_work - jest używana potem w ścieżce "/get_timer"
def check_user(user):
    query = select(
        tk_current_work_table
    ).where(
        tk_current_work_table.c.user_id == user
    ).order_by(
        desc(
            tk_current_work_table.c.work_stage_started
        )
    )
    return query


# Funkcja select_query_for_data_migration jest funkcją pomocniczną używaną potem w funkcji "data_migration" na podstawie dwóch argumentów: "query_target" i "query_parameter" wyszukuje dane w tabeli "tk_current_work_table". W zależności od późniejszego użycia jest używana albo do wyszukania wszystkich danych z tabeli "tk_current work table", albo do wyszukiwana tylko work_stage_id danego rekordu, w celu wykorzystania jako podkwerenda.
def select_query_for_data_migration(query_target, query_parameter):
    query = select(
        query_target
    ).where(
        and_(
            tk_current_work_table.c.work_stage_ended.is_not(None),
            tk_current_work_table.c.user_id == query_parameter
        )
    )
    return query


def find_client(id):
    query = select(tk_clients_table.c.client_name).select_from(
        tk_clients_table
    ).join(
        tk_projects_table, tk_projects_table.c.client_id == tk_clients_table.c.id
    ).join(
        tk_campaigns_table, tk_campaigns_table.c.project_id == tk_projects_table.c.id
    ).where(
        tk_campaigns_table.c.campaign_id == id
    )
    return query
# Funkcja "data_migration" służy do przerzucania danych między tabelami "tk_current_work_table" i "tk_finished_work_table"


def data_migration(query_parameter):
    with engine.begin() as conn:
        # Używając funkcji pomocniczej "select_query_for_data_migration" wyszukujemy z tabeli "tk_current_work_table"
        # Jako drugi argument przekazując argument przekazany do funkcji "data_migration"
        # (następuje to potem, na koniec funkcji post_time.
        find_items = conn.execute(select_query_for_data_migration(
            tk_current_work_table, query_parameter))
        # Przypisujemy do zmiennej za pomocą funkcji delete z SQLAlchemy usuwamy rekordy,
        # Których work_stage_id znajduje się w wyniku zwróconym przez subkwerendę
        # (zwróconym za pomocą operatora "in_" zaimportowanego z SQLAlchemy).
        # Aby uzyskać wynik tej subkwerendy ponownie używamy funkcji pomocniczej "select_query_for_data_migration",
        # Tym razem jako pierwszy argument podając jedynie wartość kolumny "work_stage_id"
        # Do całej funkcji przypisujemy funkcję pomocniczą "subquery()" zaimportowaną z SQLAlchemy.
        # Ma to na celu usunięcie z tabeli obecnych fragmentów pracy wszystkich fragmentów które już zostały zakończone
        # (np. kiedy użytkownik zmieni swój work stage na stronie).
        delete_query = delete(tk_current_work_table).where(
            tk_current_work_table.c.work_stage_id.in_(
                select_query_for_data_migration(
                    tk_current_work_table.c.work_stage_id, query_parameter).subquery()
            )
        )

        # Iterujemy przez wszystkie rzędy zwrócone z wyszukiwania i dodajemy ich wartości do tabeli "tk_finished_work_table"
        for each in find_items:
            client = conn.execute(find_client(each.campaign_id)).first()
            conn.execute(insert(
                tk_finished_work_table).values(
                    user_id=each.user_id,
                    work_stage_id=each.work_stage_id,
                    campaign_id=each.campaign_id,
                    campaign_name=each.campaign_name,
                    project_name=client.client_name,
                    work_stage=each.work_stage,
                    work_stage_additional_info=each.work_stage_additional_info,
                    work_stage_started=each.work_stage_started,
                    work_stage_ended=each.work_stage_ended,
                    work_stage_duration=each.work_stage_duration,
                    work_time_started=each.work_time_started,
                    work_time_ended=each.work_time_ended,
                    scheduled_start_time=each.scheduled_start_time,
                    scheduled_end_time=each.scheduled_end_time,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
            )
            )

        # Wykonujemy kwerendę usuwającą zbędne rekordy z "tk_current_work_table"
        conn.execute(delete_query)


@counter.get('/api/get_timer/<user>')
@protected
async def get_timer(request, user):
    with engine.begin() as conn:

        # Sprawdzamy czy w tabeli z obecną pracą jest login użytkownika, który przekazujemy w requeście
        find_user = conn.execute(check_user(user)).first()
    # Jeśli uda się znaleźć rekord, jego wartości są przekazane w odpowiedzi
    # W ten sposób, jeśli użytkownik wejdzie ponownie na stronę po wylogowaniu się lub wyłączeniu strony
    # Jego licznik jest automatycznie pobierany z bazy danych
    if find_user:
        response = {
            'project_name': find_user.project_name,
            'project_code': find_user.project_code,
            'campaign_name': find_user.campaign_name,
            'campaign_id': find_user.campaign_id,
            'work_stage_started': str(find_user.work_stage_started),
            'work_time_started': str(find_user.work_time_started),
            'scheduled_start_time': str(find_user.scheduled_start_time),
            'scheduled_end_time': str(find_user.scheduled_end_time),
            'auto_logout_time': str(find_user.auto_logout_time),
            'work_stage': find_user.work_stage,
            'work_stage_additional_info': find_user.work_stage_additional_info,
        }
    # Jeśli nie ma rekordów z takim loginem, odpowiedź jest pusta
    else:
        response = None
    return sanic_json({'latest_record': response})


# post_time to główna funkcja, służąca do zapisywania informacji na temat czasu pracowników z Timekeepera do bazy danych
@counter.post('/api/post_time')
@protected
async def post_time(request):
    work_data = request.json

    # Kwerenda, która wprowadza dane do tabeli "tk_current_work_table"
    insert_query = insert(tk_current_work_table).values(
        user_id=work_data['user_id'],
        project_name=work_data['project_name'],
        project_code=work_data['project_code'],
        campaign_name=work_data['campaign_name'],
        campaign_id=work_data['campaign_id'],
        work_stage=work_data['work_stage'],
        work_stage_additional_info=work_data['work_stage_additional_info'] if work_data[
            'work_stage_additional_info'] else None,
        work_stage_ended=work_data['work_stage_ended'],
        work_stage_id=work_data['work_stage_id'],
        work_stage_duration=work_data['work_stage_duration'] if work_data['work_stage_duration'] else None,
        work_time_started=work_data['work_time_started'],
        work_stage_started=work_data['work_stage_started'],
        work_time_ended=work_data['work_time_ended'],
        scheduled_end_time=work_data['scheduled_end_time'],
        scheduled_start_time=work_data['scheduled_start_time'],
        auto_logout_time=work_data['auto_logout_time'],
    )

    # Update_query za pomocą funkcji "on_duplicate_key_update" sprawdza, czy w bazie danych nie znajdują się już rekordy z takim samym, unikalnym kluczem podstawowym (w tym przypadku takim kluczem jest "work_stage_id"). Jeśli nie ma takich rekordów, kwerenda działa jak "insert" i dodaje wszystkie wartości przekazane w requeście do bazy danych. Jeżeli taki rekord jest, zostaje on zaktualizowany o nowe dane.
    # W ten sposób, jeśli pracownik na stronie zmieni swój okres pracy (np. z "Work" na "Break") to rekord dotyczący poprzedniego okresu pracy zostanie uaktualniony (przede wszystkim zostanie mu dodana godzina zakończenia danego okresu i czas jego trwania w milisekundach)
    update_query = insert_query.on_duplicate_key_update(
        user_id=insert_query.inserted.user_id,
        project_name=insert_query.inserted.project_name,
        project_code=insert_query.inserted.project_code,
        campaign_name=insert_query.inserted.campaign_name,
        campaign_id=insert_query.inserted.campaign_id,
        work_stage=insert_query.inserted.work_stage,
        work_stage_additional_info=insert_query.inserted.work_stage_additional_info,
        work_stage_ended=insert_query.inserted.work_stage_ended,
        work_stage_duration=insert_query.inserted.work_stage_duration,
        work_time_started=insert_query.inserted.work_time_started,
        work_stage_started=insert_query.inserted.work_stage_started,
        work_time_ended=insert_query.inserted.work_time_ended,
        scheduled_end_time=insert_query.inserted.scheduled_end_time,
        scheduled_start_time=insert_query.inserted.scheduled_start_time,
        auto_logout_time=insert_query.inserted.auto_logout_time
    )

    # Kwerenda, która sprawdza czy w tabeli z obecnymi okresami pracy znajduje się rekord z loginem obecnego użytkownika i przesyłanym w requeście work_stage_id.
    # W skrócie: sprawdza czy na pewno okres pracy został zapisany i poprawnie się dodał (były z tym duże problemy swego czasu, więc to swego rodzaju zabezpieczenie).
    added_query = select(
        tk_current_work_table.c.user_id
    ).where(
        and_(
            tk_current_work_table.c.user_id == work_data['user_id'],
            tk_current_work_table.c.work_stage_id == work_data['work_stage_id']
        )
    )

    with engine.begin() as conn:
        conn.execute(update_query)
        added_record = conn.execute(added_query).first()

    # Przekazujemy do funkcji "data_migration" login użytkownika jako parametr, który potem będzie przekazany funkcjom pomocniczym opisanym powyżej. Funkcja przepisuje rekordy z tabeli aktywnego czasu pracy do tabeli zakończonego czasu pracy i kasuje niepotrzebne rekordy.
    data_migration(work_data['user_id'])

    if added_record:
        check_added = True
    else:
        check_added = False

    return sanic_json({
        'added': check_added,
        'id': work_data['work_stage_id']
    })


# Funkcja "get_id" używa loginu użytkownika, który wysłał request i zwraca work_stage_id z tabeli tk_current_work_table w celu dodatkowego sprawdzenia danych potrzebnych do zapisania okresu pracy w bazie danych.
# Obecnie raczej niekoniecznie potrzebna, ale jej usunięcie wymagałoby ponownego rozgrzebania frontendu, więc może kiedyś.
@counter.get('/api/get_id/<user_id>')
@protected
async def get_id(request, user_id):
    user_query = select(tk_current_work_table.c.work_stage_id).where(
        tk_current_work_table.c.user_id == user_id
    )
    with engine.begin() as conn:
        work_id = conn.execute(user_query).first()

    if (work_id):
        response = {
            'recordId': work_id.work_stage_id
        }
    else:
        response = None
    return sanic_json(response)


# Ścieżka "/finish_work" służy do kończeniu danego dnia pracy i zapisywania informacji na jego temat w bazie danych.
@counter.post('/api/finish_work')
@protected
async def finish_work(request):
    user = request.json.get('user_id')
    date = request.json.get('date_id')
    work_start = request.json.get('work_time_started')
    work_end = request.json.get('work_time_ended')
    # Kopiujemy finałową porcję danych z tabeli "tk_current_work_table" do "tk_finished_work_table" i usuwamy zbędne rekordy.
    data_migration(user)
    # Aktualizujemy "tk_finished_work_table" - dodajemy godzinę zakończenia całego dnia pracy do wszystkich poprzednich rekordów z tego samego dnia.
    update_end_time_query = update(tk_finished_work_table).where(
        and_(
            tk_finished_work_table.c.work_time_started == work_start,
            tk_finished_work_table.c.user_id == user,
            tk_finished_work_table.c.work_time_started.like(f"%{date}%")
        )
    ).values(
        work_time_ended=work_end
    )
    with engine.begin() as conn:
        conn.execute(update_end_time_query)
    return text(work_start)


def move_from_current_work(record):
    if record.work_stage_started > record.scheduled_end_time:
        diff = record.auto_logout_time - record.work_stage_started
        work_stage_ended = record.auto_logout_time
        work_time_ended = record.auto_logout_time
    else:
        diff = record.scheduled_end_time - record.work_stage_started
        work_stage_ended = record.scheduled_end_time
        work_time_ended = record.scheduled_end_time
    formated_diff = int(diff.total_seconds()*1000)
    with engine.begin() as conn:
        client = conn.execute(find_client(record.campaign_id)).first()
        conn.execute(
            insert(tk_finished_work_table).values(
                user_id=record.user_id,
                work_stage_id=record.work_stage_id,
                campaign_id=record.campaign_id,
                campaign_name=record.campaign_name,
                project_name=client.client_name,
                work_stage=record.work_stage,
                work_stage_additional_info=record.work_stage_additional_info,
                work_stage_started=record.work_stage_started,
                work_stage_ended=work_stage_ended,
                work_stage_duration=str(formated_diff),
                work_time_started=record.work_time_started,
                work_time_ended=work_time_ended,
                scheduled_start_time=record.scheduled_start_time,
                scheduled_end_time=record.scheduled_end_time,
                auto_logout=True,
                update_reason='Auto Logout',
                edited_by='Automat',
                created_at=datetime.now(),
                updated_at=datetime.now()
            ))
        # conn.execute(
        #     update(
        #         tk_finished_work_table
        #     ).where(
        #         tk_finished_work_table.c.work_stage_ended.like(
        #             f"%{date.today()}%")
        #     ).where(
        #         tk_finished_work_table.c.user_id == record.user_id
        #     )
        #     .values(
        #         work_time_ended=work_time_ended
        #     )
        # )
        conn.execute(
            delete(
                tk_current_work_table
            ).where(
                tk_current_work_table.c.work_stage_id == record.work_stage_id
            )
        )


def group_records(records):
    groups = []
    current_group = [records[0]]

    for i in range(1, len(records)):
        current_record = records[i]
        previous_record = records[i - 1]

        if current_record['ws_started'] - previous_record['ws_ended'] <= timedelta(minutes=0):
            # No gap, add to the current group
            current_group.append(current_record)
        else:
            # Gap found, start a new group
            groups.append(current_group)
            current_group = [current_record]

    # Add the last group
    groups.append(current_group)

    return groups


def update_work_end_time(user_id, selected_date):
    with engine.begin() as conn:
        result = conn.execute(
            select(tk_finished_work_table.c.work_stage_id,
                   tk_finished_work_table.c.work_stage_started,
                   tk_finished_work_table.c.work_stage_ended
                   ).where(
                tk_finished_work_table.c.user_id == user_id,
                tk_finished_work_table.c.work_stage_ended.like(
                    f"%{selected_date}%")
            ).order_by(
                tk_finished_work_table.c.work_stage_started
            )
        ).fetchall()
    fixed = [{'id': d.work_stage_id,
             'ws_started': d.work_stage_started,
              'ws_ended': d.work_stage_ended,
              } for d in result]

    # Group the records
    record_groups = group_records(fixed)

    # Update 'wt_started' and 'wt_ended' for each group
    for group in record_groups:
        group_start_times = [record['ws_started'] for record in group]
        group_end_times = [record['ws_ended'] for record in group]

        earliest_start_time = min(group_start_times)
        latest_end_time = max(group_end_times)

        with engine.begin() as conn:
            conn.execute(update(
                tk_finished_work_table
            ).where(
                tk_finished_work_table.c.user_id == user_id,
                tk_finished_work_table.c.work_stage_ended.like(
                    f"%{selected_date}%"),
                tk_finished_work_table.c.work_stage_started >= earliest_start_time,
                tk_finished_work_table.c.work_stage_ended <= latest_end_time
            ).values(
                work_time_started=earliest_start_time,
                work_time_ended=latest_end_time
            ))
