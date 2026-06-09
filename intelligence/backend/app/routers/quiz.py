from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..auth import get_current_user
from ..models import User, QuizResult
from ..schemas import QuizCreateRequest, QuizSubmissionRequest, QuizEvaluationResponse
from ..agents.quiz_agent import QuizAgent

router = APIRouter(
    prefix="/quiz",
    tags=["quiz"]
)

quiz_agent = QuizAgent()

@router.post("/generate")
def generate_new_quiz(
    payload: QuizCreateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generates an AI-powered quiz customized by domain, difficulty, and question length.
    """
    questions = quiz_agent.generate_quiz(
        domain=payload.domain,
        difficulty=payload.difficulty,
        count=payload.question_count,
        q_type=payload.question_type
    )
    
    # Hide correct answers from the response payload for security
    sanitized_questions = []
    for q in questions:
        q_copy = q.copy()
        if "correct_option" in q_copy:
            del q_copy["correct_option"]
        sanitized_questions.append(q_copy)
        
    return sanitized_questions

@router.post("/submit", response_model=QuizEvaluationResponse)
def submit_quiz_answers(
    payload: QuizSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates submitted answers, calculates score/accuracy, saves history, and gives AI feedback.
    """
    # 1. Regenerate quiz with correct answers to evaluate user answers securely
    raw_quiz = quiz_agent.generate_quiz(
        domain=payload.domain,
        difficulty=payload.difficulty,
        count=len(payload.questions),
        q_type="MCQ"
    )
    
    # 2. Evaluate answers
    evaluation = quiz_agent.evaluate_quiz(raw_quiz, payload.answers)
    
    # 3. Store result in DB
    db_quiz_result = QuizResult(
        user_id=current_user.id,
        domain=payload.domain,
        difficulty=payload.difficulty,
        questions=payload.questions,
        answers=payload.answers,
        score=evaluation["score"],
        accuracy=evaluation["accuracy"],
        feedback=evaluation["feedback"]
    )
    db.add(db_quiz_result)
    db.commit()
    
    return evaluation

@router.get("/history")
def get_quiz_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves history of user's taken quizzes.
    """
    results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).order_by(QuizResult.created_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "domain": r.domain,
            "difficulty": r.difficulty,
            "score": r.score,
            "total": len(r.questions),
            "accuracy": r.accuracy,
            "feedback": r.feedback,
            "created_at": r.created_at
        }
        for r in results
    ]
