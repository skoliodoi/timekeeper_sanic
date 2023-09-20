from sqlalchemy import create_engine, MetaData, Table
from dotenv import load_dotenv
import os

load_dotenv()


engine = create_engine(
    f"mysql+pymysql://{os.environ.get('DB_USERNAME')}:{os.environ.get('DB_PASSWORD')}@{os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}/{os.environ.get('DB_DATABASE')}?charset=utf8mb4", echo=True)


# metadata = MetaData(engine)
metadata = MetaData(engine)

# tk_users_table = Table('dummy_users', metadata, autoload=True)
# tk_campaigns_table = Table('dummy_projects', metadata, autoload=True)
# tk_user_campaign_table = Table('dummy_user_project', metadata, autoload=True)
# tk_project_owner_table = Table('dummy_coordinator_project', metadata, autoload=True)
# tk_current_work_table = Table('dummy_current_work', metadata, autoload=True)
# tk_finished_work_table = Table('dummy_finished_work', metadata, autoload=True)
# tk_deleted_records_table = Table('dummy_deleted_records', metadata, autoload=True)

tk_users_table = Table('tk_users', metadata, autoload=True)
tk_current_work_table = Table('tk_current_work_table', metadata, autoload=True)
tk_campaigns_table = Table('tk_campaigns', metadata, autoload=True)
tk_clients_table = Table('tk_clients', metadata, autoload=True)
tk_projects_table = Table('tk_projects', metadata, autoload=True)
tk_campaign_statuses_table = Table('tk_campaign_statuses', metadata, autoload=True)
tk_schedules_table = Table('tk_schedules', metadata, autoload=True)
tk_user_campaign_table = Table('tk_user_campaign', metadata, autoload=True)
tk_project_owner_table = Table('tk_po_campaign', metadata, autoload=True)
tk_finished_work_table = Table('tk_finished_work_table', metadata, autoload=True)



tk_deleted_records_table = Table('tk_deleted_records', metadata, autoload=True)
# tk_current_work_dumpster_table = Table('tk_current_work_table_dumpster', metadata, autoload=True)
# tk_current_work_table = Table('tk_current_work_table', metadata, autoload=True)
