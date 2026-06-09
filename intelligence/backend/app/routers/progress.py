from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from ..auth import get_current_user
from ..models import User, Resume, ResumeScore, QuizResult, InterviewResult, LearningPlan
from ..schemas import ProgressResponse
from ..agents.progress_agent import ProgressAgent

router = APIRouter(
    prefix="/progress",
    tags=["progress dashboard"]
)

progress_agent = ProgressAgent()

@router.get("", response_model=ProgressResponse)
def get_user_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compiles dashboard scores, progress timeline chart coordinates, and AI recommended next actions.
    """
    # 1. Fetch latest resume score
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    resume_score = 0
    if resume:
        res_score_record = db.query(ResumeScore).filter(ResumeScore.resume_id == resume.id).first()
        if res_score_record:
            resume_score = res_score_record.overall_score
            
    # 2. Fetch quiz statistics
    quizzes = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    avg_quiz = int(sum(q.accuracy for q in quizzes) / len(quizzes)) if quizzes else 0
    
    # 3. Fetch interview statistics
    interviews = db.query(InterviewResult).filter(InterviewResult.user_id == current_user.id).all()
    avg_interview = int(sum(i.scores.get("overall", 0) for i in interviews) / len(interviews)) if interviews else 0
    
    # 4. Check learning plan
    plan = db.query(LearningPlan).filter(LearningPlan.user_id == current_user.id).order_by(LearningPlan.created_at.desc()).first()
    roadmap_exists = bool(plan)
    learning_comp = 45 if roadmap_exists else 0 # Mock initial steps completed for UI display
    
    # Inferred skill match score
    skill_match = 72 if roadmap_exists else 0
    if resume_score > 0 and not roadmap_exists:
        skill_match = 50
        
    # 5. Compile timeline data for Recharts line chart
    timeline = []
    # Base milestone: Account registered
    base_time = current_user.created_at or (datetime.utcnow() - timedelta(days=5))
    timeline.append({
        "date": base_time.strftime("%b %d"),
        "label": "Registered",
        "value": 40
    })
    
    if resume:
        timeline.append({
            "date": resume.created_at.strftime("%b %d"),
            "label": "Resume Scanned",
            "value": resume_score
        })
        
    for idx, q in enumerate(quizzes[-3:]): # Last 3 quizzes
        timeline.append({
            "date": q.created_at.strftime("%b %d"),
            "label": f"Quiz {idx+1}",
            "value": int(q.accuracy)
        })
        
    for idx, i in enumerate(interviews[-3:]): # Last 3 interviews
        timeline.append({
            "date": i.created_at.strftime("%b %d"),
            "label": f"Interview {idx+1}",
            "value": i.scores.get("overall", 0)
        })
        
    # Ensure timeline is sorted chronologically
    timeline = sorted(timeline, key=lambda x: x["date"])
    
    # 6. Build quiz and interview history lists
    quiz_history = [
        {
            "date": q.created_at.strftime("%m/%d/%Y"),
            "role": q.domain,
            "type": q.difficulty,
            "score": f"{int(q.accuracy)}/100"
        }
        for q in quizzes
    ]

    interview_history = [
        {
            "date": i.created_at.strftime("%m/%d/%Y"),
            "role": i.role,
            "type": i.type,
            "score": f"{i.scores.get('overall', 0)}/100"
        }
        for i in interviews
    ]

    # 7. Generate next actions via ProgressAgent
    next_actions = progress_agent.generate_next_actions(
        resume_score=resume_score,
        avg_quiz_score=avg_quiz,
        avg_interview_score=avg_interview,
        roadmap_exists=roadmap_exists
    )
    
    return {
        "resume_score": resume_score,
        "skill_match_score": skill_match,
        "avg_quiz_score": avg_quiz,
        "avg_interview_score": avg_interview,
        "learning_completion_rate": learning_comp,
        "timeline": timeline,
        "next_actions": next_actions,
        "quiz_history": quiz_history,
        "interview_history": interview_history
    }
