# Docker Compose Microservices Setup

This setup uses Docker Compose to run a set of microservices including RabbitMQ, PostgreSQL databases for main and mailer services, Prometheus for monitoring, and Grafana for data visualization. Additionally, two application services, `main` and `mailer`, are configured to communicate with these dependencies.

## Prerequisites

- Docker and Docker Compose installed on your system

## Services Overview

1. **RabbitMQ**: Acts as the message broker.
2. **Postgres Databases**: Separate instances for `main` and `mailer` services.
3. **Main Service**: Primary application service.
4. **Mailer Service**: Handles email functionality.
5. **Prometheus**: For monitoring RabbitMQ metrics.
6. **Grafana**: For visualizing metrics.

## Starting the Services

To start all services, navigate to the directory containing `docker-compose.yml` and run:

```bash
docker-compose up -d
```

This command will build and run all containers in the background.

To check the logs for any specific service, use:

```bash
docker-compose logs -f <service_name>
```

Replace `<service_name>` with any of the following:
- `rabbitmq`
- `postgres_main`
- `postgres_mailer`
- `main`
- `mailer`
- `prometheus`
- `grafana`

### Accessing Services

- **RabbitMQ Management Console**: [http://localhost:15672](http://localhost:15672)
    - Default login: `guest`, password: `guest`
- **Prometheus**: [http://localhost:9090](http://localhost:9090)
- **Grafana**: [http://localhost:8181](http://localhost:8181)
    - Default login: `admin`, password: `admin`
- **Main Service**: [http://localhost:3000](http://localhost:3000)
- **Mailer Service**: [http://localhost:3001](http://localhost:3001)

## Running Tests

To run tests for the `mailer` service, execute the following command:

```bash
docker-compose run mailer npm run test
```

This command will run the tests inside the `mailer` service container. Replace `npm run test` with the specific test command if it differs in your `package.json` setup.

## Stopping Services

To stop and remove all services, use:

```bash
docker-compose down
```

This will stop the containers and remove them, along with any associated networks created by Docker Compose.

---

### Notes

- **Environment Variables**: Customize `.env` or add secure environment variables as required.
- **Volumes**: Persistent storage is configured for PostgreSQL databases to retain data between container restarts.

This completes the setup and usage instructions for the microservices environment.
