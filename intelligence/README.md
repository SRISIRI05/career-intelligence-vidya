# VidyaMitra – Intelligent Career Agent

VidyaMitra is a production-ready, full-stack AI-powered career guidance platform. It guides students and professionals from resume scans and skill-gap identification to learning paths, AI-generated quizzes, interactive text/voice mock interviews, and job recommendations.

## Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide Icons, Axios.
*   **Backend**: Python, FastAPI, LangChain, SQLAlchemy, Pydantic, PyPDF, python-docx.
*   **Database**: Supabase PostgreSQL (supports local SQLite fallback).
*   **AI Integrations**: OpenAI GPT-4, SpeechRecognition & SpeechSynthesis Web APIs (frontend voice mode).
*   **External APIs**: YouTube Data API, Google Search API, Pexels API, News API, Exchange Rate API.

## Project Structure

```
fearless-pascal/
├── backend/
│   ├── app/
│   │   ├── agents/         # LangChain specialized career agents
│   │   ├── routers/        # API endpoints
│   │   ├── auth.py         # Passwords & JWT validation
│   │   ├── config.py       # Pydantic Settings
│   │   ├── database.py     # SQLAlchemy DB connection setup
│   │   ├── models.py       # Database model mapping
│   │   ├── schemas.py      # Request & response validations
│   │   └── main.py         # Application root
│   ├── .env                # Local secrets
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (Layout, ProtectedRoute, GlassCard)
│   │   ├── context/        # React AuthContext
│   │   ├── pages/          # Pages (Login, Register, Dashboard, Resume, Quiz, Interview)
│   │   ├── services/       # api.js Axios configuration
│   │   ├── App.jsx         # Routes mapping
│   │   └── index.css       # Custom glassmorphic utilities
│   ├── nginx.conf          # Nginx routing proxies
│   └── package.json        # Node modules manifest
├── docker-compose.yml      # Containerized coordinate
├── supabase_schema.sql     # Database tables creation
└── README.md
```

## Running Locally

### 1. Backend Setup

1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Boot the dev server:
    ```bash
    python -m uvicorn app.main:app --reload
    ```
    *The API will be available at `http://localhost:8000`.*

### 2. Frontend Setup

1.  Navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
    *The site will be live at `http://localhost:5173`.*

## Running with Docker Compose (Production Setup)

Build and run both client and server containers with a single command from the project root:

```bash
docker-compose up --build
```

*   The frontend client will be available at `http://localhost`.
*   The backend API will run on `http://localhost:8000`.

## Supabase PostgreSQL Setup

To connect to a live Supabase cloud database:
1.  Run the DDL scripts in `supabase_schema.sql` inside the Supabase SQL editor.
2.  Copy your database connection URL (transaction mode or direct port 5432).
3.  Update the `DATABASE_URL` field in `backend/.env`.

If `DATABASE_URL` is left empty, the application automatically boots a local SQLite database (`vidyamitra.db`) in the root directory for instant demonstration.

## OpenAI / LLM Configurations

*   Place your OpenAI API key in `OPENAI_API_KEY` inside `backend/.env`.
*   If the key is missing or blank, all specialized agents (ResumeAgent, SkillAgent, PlannerAgent, QuizAgent, InterviewAgent, JobAgent) gracefully switch to robust local mock engines, returning highly tailored and interactive results for developer testing.
