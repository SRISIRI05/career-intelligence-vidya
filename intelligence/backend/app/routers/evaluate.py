from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Resume
from ..schemas import EligibilityCheckRequest, EligibilityCheckResponse
from ..agents.skill_agent import SkillAgent

router = APIRouter(
    prefix="/evaluate",
    tags=["eligibility"]
)

skill_agent = SkillAgent()

@router.post("", response_model=EligibilityCheckResponse)
def check_eligibility(
    payload: EligibilityCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates profile compatibility and eligibility for a selected job role.
    """
    # 1. Fetch latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a resume first to evaluate eligibility."
        )
        
    # 2. Evaluate using SkillAgent
    eligibility = skill_agent.evaluate_eligibility(
        resume_skills=resume.parsed_skills,
        education=resume.parsed_education,
        projects=resume.parsed_projects,
        certifications=resume.parsed_certifications,
        target_role=payload.role
    )
    
    return eligibility
