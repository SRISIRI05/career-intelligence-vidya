from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Resume, SkillAnalysis
from ..schemas import SkillAnalysisResponse
from ..agents.skill_agent import SkillAgent

router = APIRouter(
    prefix="/skills",
    tags=["skills"]
)

skill_agent = SkillAgent()

@router.get("/gap", response_model=SkillAnalysisResponse)
def get_skill_gap(
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the skill gap analysis comparing the user's latest resume to the target role.
    Saves the analysis in the database.
    """
    # 1. Fetch latest resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload your resume before analyzing skill gaps."
        )
        
    # 2. Invoke SkillAgent gap evaluation
    gap_data = skill_agent.analyze_gaps(resume.parsed_skills, role)
    
    # 3. Cache or update analysis record
    db_analysis = db.query(SkillAnalysis).filter(SkillAnalysis.resume_id == resume.id).first()
    if not db_analysis:
        db_analysis = SkillAnalysis(
            resume_id=resume.id,
            user_id=current_user.id
        )
        db.add(db_analysis)
        
    db_analysis.missing_skills = gap_data.get("missing_skills", [])
    db_analysis.weak_skills = gap_data.get("weak_skills", [])
    db_analysis.recommended_skills = gap_data.get("recommended_skills", [])
    db_analysis.suggestions = gap_data.get("suggestions", [])
    
    db.commit()
    db.refresh(db_analysis)
    
    return db_analysis
