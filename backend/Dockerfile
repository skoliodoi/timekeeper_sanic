# FROM sanicframework/sanic:3.8-latest
FROM python:3.8.3-slim

WORKDIR /app


COPY . /app

COPY requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt




ENV key=value

EXPOSE 5000
