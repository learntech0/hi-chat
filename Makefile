include .env

up:
	docker compose down --remove-orphans
	docker compose build
	docker compose up

down:
	docker compose down --remove-orphans

db_init:
	flask --app app/v1 db init
	flask db init

db_migrate:
	flask --app app/v1 db migrate -m "Initial migration"
	flask db migrate -m "Initial migration"

db_upgrade:
	flask --app app/v1 db upgrade
	flask db upgrade