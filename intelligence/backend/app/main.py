from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, resume, evaluate, skills, plan, quiz, interview, jobs, progress, news, resources

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VidyaMitra – Intelligent Career Agent API",
    description="Backend services for VidyaMitra AI career guidance, roadmap generator, mock interviews and progress tracking.",
    version="1.0.0"
)

# CORS configurations for local dev + production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API module routing
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(evaluate.router)
app.include_router(skills.router)
app.include_router(plan.router)
app.include_router(quiz.router)
app.include_router(interview.router)
app.include_router(jobs.router)
app.include_router(progress.router)
app.include_router(news.router)
app.include_router(resources.router)

@app.get("/")
def read_root():
    return {
        "app": "VidyaMitra – Intelligent Career Agent",
        "status": "online",
        "version": "1.0.0"
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
