from sanic import Sanic
from sanic_ext import Extend
from .routes.counter_routes import counter
from .schedules.scheduled_actions import search_for_ghost_projects, check_if_finished, backup_tk_finished, backup_rest
from .routes.project_routes import project
from .routes.user_routes import users
from .routes.work_history_routes import history
from .routes.schedule_routes import schedules
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv


load_dotenv()


def create_app():
    scheduler = BackgroundScheduler(timezone='Europe/Warsaw')
    scheduler.start()
    app = Sanic("tk_backend")
    # app.config.CORS_ORIGINS = os.environ.get('CORS_ALLOWED')
    app.config.SECRET = os.environ.get('SAFETY_KEY')
    app.config.CORS_ORIGINS = '*'
    app.config.CORS_EXPOSE_HEADER = [
        'content-disposition', 'Content-Disposition']
    app.blueprint(counter)
    app.blueprint(project)
    app.blueprint(users)
    app.blueprint(history)
    app.blueprint(schedules)
    scheduler.add_job(check_if_finished, 'interval', minutes=1)
    scheduler.add_job(search_for_ghost_projects, 'interval', minutes=15)
    scheduler.add_job(backup_tk_finished, 'cron', hour=23, minute=59)
    scheduler.add_job(backup_rest, 'interval', weeks=1)
    Extend(app)

    return app
