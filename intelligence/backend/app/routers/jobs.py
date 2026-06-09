from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Resume, JobRecommendation
from ..schemas import JobRecommendationsResponse
from ..agents.job_agent import JobAgent

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"]
)

job_agent = JobAgent()

@router.get("", response_model=JobRecommendationsResponse)
def get_job_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Formulates a list of job postings aligned with the user's domain and resume skills.
    Caches recommendations in the database.
    """
    # 1. Fetch latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    
    # Defaults if no resume is uploaded yet
    skills = []
    domain = "Full Stack Development"
    
    if resume:
        skills = resume.parsed_skills
        # Try to infer domain or fall back
        domain = "Software Engineering"
        
    # 2. Invoke JobAgent
    jobs = job_agent.recommend_jobs(domain, skills)
    
    # 3. Cache recommendations
    db_rec = db.query(JobRecommendation).filter(JobRecommendation.user_id == current_user.id).first()
    if not db_rec:
        db_rec = JobRecommendation(user_id=current_user.id)
        db.add(db_rec)
        
    db_rec.recommendations = jobs
    db.commit()
    
    return {"recommendations": jobs}
