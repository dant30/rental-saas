# Rental SaaS

This repository contains a multi-tenant rental management SaaS platform (Django backend + React frontend).

## Getting Started

### Backend

1. Create a Python virtual environment and activate it.
2. Install dependencies:

```bash
python -m pip install -r backend/requirements/dev.txt
```

3. Configure environment variables:

- Copy `backend/.env.example` to `backend/.env` and apply your values.

4. Run migrations:

```bash
cd backend
python manage.py migrate_schemas --shared
python manage.py migrate
```

5. Create a superuser:

```bash
python manage.py createsuperuser
```

6. Run the development server:

```bash
python manage.py runserver
```

### Running tests

Tests use Django’s test runner and assume PostgreSQL is available (required by django-tenants):

```bash
cd backend
python manage.py test
```

### Tenant signup (onboarding)

You can create a new tenant (schema + domain) and an initial admin user via the API:

```
POST /api/tenants/signup/
```

Example request body:

```json
{
  "schema_name": "acme",
  "name": "Acme Property",
  "domain": "acme.localhost",
  "admin_username": "admin",
  "admin_email": "admin@acme.localhost",
  "admin_password": "SuperSecret123"
}
```

### Frontend

The frontend is a Vite + React + TypeScript application located in `frontend/`.

> TODO: Add frontend setup instructions once the UI is implemented.
