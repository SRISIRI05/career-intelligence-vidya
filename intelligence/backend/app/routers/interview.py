import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Any

from ..database import get_db
from ..auth import get_current_user
from ..models import User, InterviewResult
from ..schemas import (
    InterviewStartRequest, InterviewStartResponse, 
    InterviewMessageRequest, InterviewMessageResponse,
    InterviewEvaluateRequest, InterviewEvaluationResponse
)
from ..agents.interview_agent import InterviewAgent

router = APIRouter(
    prefix="/interview",
    tags=["mock interview"]
)

interview_agent = InterviewAgent()

# Global dict to store interview sessions: session_id -> { "role": str, "type": str, "transcript": List[Dict[str, str]] }
INTERVIEW_SESSIONS: Dict[str, Dict[str, Any]] = {}

@router.post("/start", response_model=InterviewStartResponse)
def start_interview(
    payload: InterviewStartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Initializes a mock interview session and returns the first question.
    """
    session_id = str(uuid.uuid4())
    first_question = interview_agent.get_first_question(payload.type, payload.role)
    
    INTERVIEW_SESSIONS[session_id] = {
        "role": payload.role,
        "type": payload.type,
        "transcript": [
            {"sender": "ai", "text": first_question}
        ]
    }
    
    return {
        "session_id": session_id,
        "first_question": first_question
    }

@router.post("/chat", response_model=InterviewMessageResponse)
def send_interview_response(
    payload: InterviewMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Accepts user responses (from voice transcript or typing), appends history, and asks the next question.
    """
    session = INTERVIEW_SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active interview session not found. Please restart the interview."
        )
        
    # Append user answer
    session["transcript"].append({"sender": "user", "text": payload.user_answer})
    
    # Generate follow-up or complete
    next_step = interview_agent.generate_next_response(
        role=session["role"],
        int_type=session["type"],
        transcript=session["transcript"]
    )
    
    # Append AI question
    ai_text = next_step.get("ai_response", "Let's move to the next item.")
    session["transcript"].append({"sender": "ai", "text": ai_text})
    
    return {
        "ai_response": ai_text,
        "is_finished": next_step.get("is_finished", False)
    }

@router.post("/evaluate", response_model=InterviewEvaluationResponse)
def evaluate_completed_interview(
    payload: InterviewEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits the full interview session dialog for analysis, saves the score card, and cleans up the session cache.
    """
    session = INTERVIEW_SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or already evaluated."
        )
        
    # 1. Run evaluation
    scores_card = interview_agent.evaluate_interview(
        role=session["role"],
        int_type=session["type"],
        transcript=session["transcript"]
    )
    
    # 2. Save result
    db_result = InterviewResult(
        user_id=current_user.id,
        role=session["role"],
        type=session["type"],
        transcript=session["transcript"],
        scores={
            "overall": scores_card.get("overall_score", 0),
            "communication": scores_card.get("communication", 0),
            "technical_accuracy": scores_card.get("technical_accuracy", 0),
            "confidence": scores_card.get("confidence", 0),
            "problem_solving": scores_card.get("problem_solving", 0),
            "clarity": scores_card.get("clarity", 0)
        },
        strengths=scores_card.get("strengths", []),
        weaknesses=scores_card.get("weaknesses", []),
        recommendations=scores_card.get("recommendations", [])
    )
    db.add(db_result)
    db.commit()
    
    # Clean cache
    del INTERVIEW_SESSIONS[payload.session_id]
    
    return {
        "overall_score": db_result.scores.get("overall", 0),
        "communication": db_result.scores.get("communication", 0),
        "technical_accuracy": db_result.scores.get("technical_accuracy", 0),
        "confidence": db_result.scores.get("confidence", 0),
        "problem_solving": db_result.scores.get("problem_solving", 0),
        "clarity": db_result.scores.get("clarity", 0),
        "strengths": db_result.strengths,
        "weaknesses": db_result.weaknesses,
        "recommendations": db_result.recommendations
    }

@router.get("/history")
def get_interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the history of user mock interview evaluations.
    """
    results = db.query(InterviewResult).filter(InterviewResult.user_id == current_user.id).order_by(InterviewResult.created_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "role": r.role,
            "type": r.type,
            "overall_score": r.scores.get("overall", 0),
            "created_at": r.created_at
        }
        for r in results
    ]
