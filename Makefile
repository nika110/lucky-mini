up:
	docker-compose -f ./docker-compose.yml up -d

down:
	docker-compose -f ./docker-compose.yml down --remove-orphans

restart:
	docker-compose -f ./docker-compose.yml restart

logs:
	docker-compose -f ./docker-compose.yml logs -f

volume-prune:
	docker volume prune -af