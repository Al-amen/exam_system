
# Task For Python Developer

# 📝 Online Exam Management System

An end‑to‑end **Online Exam Management System** built with **FastAPI**, **PostgreSQL**, and **React**.  
It enables administrators to manage exams and question banks, while students can participate in exams with autosave, resume, and automatic grading.

---

## 🚀 Features

- **Authentication & Roles**
  - JWT‑based login/register for Admins and Students
  - Role‑based access control

- **Question Bank**
  - Import questions from Excel (.xlsx)
  - Preview, validate, and confirm import
  - Search, filter, and view questions

- **Exam Management**
  - Create exams by selecting questions
  - Set exam time window and duration
  - Publish/unpublish exams

- **Exam Participation**
  - Students can start exams, autosave progress, and resume if disconnected
  - Submit answers before expiry
  - Objective questions auto‑graded instantly

- **Results**
  - Immediate score for objective questions
  - Pending manual review for text/image answers
  - Results visible to both Admin and Student dashboards

---

## 🛠️ Tech Stack

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- Alembic (migrations)
- JWT Authentication
- Pytest (unit & integration tests)

**Frontend**
- React (Vite)
- React Router
- Axios
- TailwindCSS

**DevOps**
- Docker & Docker Compose
- `.env` configuration for secrets
- GitHub for version control

---



## 📂 Project Structure

```text
online-exam-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── question.py
│   │   │   ├── exam.py
│   │   │   └── attempt.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── question.py
│   │   │   ├── exam.py
│   │   │   └── attempt.py
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── question.py
│   │   │   ├── exam.py
│   │   │   └── attempt.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── questions.py
│   │   │   │   ├── exams.py
│   │   │   │   └── attempts.py
│   │   │   └── utils.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── excel_parser.py
│   │   │   ├── grading.py
│   │   │   └── autosave.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_excel_parser.py
│   │       └── test_grading.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── common/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── contexts/
│   │   └── App.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

```text

Configure environment variables
create .env file 

POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=exam_system

SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_STRING
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
BACKEND_CORS_ORIGINS=http://localhost:5173



```

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```
cd frontend
npm install
npm run dev
```
