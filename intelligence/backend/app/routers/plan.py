from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Resume, SkillAnalysis, LearningPlan
from ..schemas import LearningPlanCreateRequest, LearningPlanResponse
from ..agents.planner_agent import PlannerAgent

router = APIRouter(
    prefix="/plan",
    tags=["learning roadmap"]
)

planner_agent = PlannerAgent()

@router.post("/generate", response_model=LearningPlanResponse)
def generate_plan(
    payload: LearningPlanCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a personalized 3-month roadmap for a selected domain and role.
    """
    # 1. Retrieve latest resume & skill gap
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    missing_skills = []
    
    if resume:
        analysis = db.query(SkillAnalysis).filter(SkillAnalysis.resume_id == resume.id).first()
        if analysis:
            missing_skills = analysis.missing_skills
            
    # 2. Invoke PlannerAgent
    roadmap_data = planner_agent.generate_roadmap(payload.role, missing_skills)
    
    # 3. Check if plan already exists for this role and update, or create new
    db_plan = db.query(LearningPlan).filter(
        LearningPlan.user_id == current_user.id,
        LearningPlan.role == payload.role
    ).first()
    
    if not db_plan:
        db_plan = LearningPlan(
            user_id=current_user.id,
            domain=payload.domain,
            role=payload.role
        )
        db.add(db_plan)
        
    db_plan.roadmap = roadmap_data
    db.commit()
    db.refresh(db_plan)
    
    return db_plan

@router.get("/latest", response_model=LearningPlanResponse)
def get_latest_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the user's latest generated learning roadmap.
    """
    db_plan = db.query(LearningPlan).filter(LearningPlan.user_id == current_user.id).order_by(LearningPlan.created_at.desc()).first()
    if not db_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No learning plan found. Please select a domain and role to generate one."
        )
    return db_plan
