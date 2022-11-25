FROM postgres:latest

ENV POSTGRES_PASSWORD="postgres"
ENV POSTGRES_USER="postgres"
ENV POSTGRES_DB="postgres"

VOLUME db:/var/lib/postgresql/data  db/init.sql:/docker-entrypoint-initdb.d/create_tables.sql
EXPOSE 5432