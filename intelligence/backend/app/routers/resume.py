import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
from pypdf import PdfReader
from docx import Document

from ..database import get_db
from ..auth import get_current_user
from ..models import User, Resume, ResumeScore, SkillAnalysis
from ..schemas import ResumeParseResponse, ResumeScoreResponse
from ..agents.resume_agent import ResumeAgent
from ..storage import upload_file_to_supabase

router = APIRouter(
    prefix="/resume",
    tags=["resume"]
)

resume_agent = ResumeAgent()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        return text
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing PDF file: {str(e)}"
        )

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing DOCX file: {str(e)}"
        )

@router.post("/parse")
async def parse_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Parses and scores an uploaded resume (PDF/DOCX) or raw text input.
    """
    text_content = ""
    filename = "manual_entry.txt"
    file_url = None
    
    if file:
        filename = file.filename
        content = await file.read()
        file_url = upload_file_to_supabase(filename, content, file.content_type or "application/octet-stream")
        
        if filename.endswith(".pdf"):
            text_content = extract_text_from_pdf(content)
        elif filename.endswith(".docx"):
            text_content = extract_text_from_docx(content)
        else:
            # Try parsing as plain text
            try:
                text_content = content.decode("utf-8")
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unsupported file format. Please upload PDF or DOCX."
                )
    elif raw_text:
        text_content = raw_text
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a file or raw resume text."
        )
        
    if not text_content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided resume content is empty."
        )
        
    # 1. Parse text using ResumeAgent
    parsed = resume_agent.parse_resume(text_content)
    
    # 2. Score parsed resume
    scores_data = resume_agent.evaluate_resume(parsed)
    
    # 3. Save resume to db
    db_resume = Resume(
        user_id=current_user.id,
        filename=filename,
        file_content_text=text_content,
        file_url=file_url,
        parsed_skills=parsed.get("skills", []),
        parsed_education=parsed.get("education", []),
        parsed_projects=parsed.get("projects", []),
        parsed_certifications=parsed.get("certifications", []),
        parsed_experience=parsed.get("experience", [])
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # 4. Save resume score card
    db_score = ResumeScore(
        resume_id=db_resume.id,
        user_id=current_user.id,
        ats_score=scores_data.get("ats_score", 0),
        technical_score=scores_data.get("technical_score", 0),
        communication_score=scores_data.get("communication_score", 0),
        projects_score=scores_data.get("projects_score", 0),
        certifications_score=scores_data.get("certifications_score", 0),
        experience_score=scores_data.get("experience_score", 0),
        overall_score=scores_data.get("overall_score", 0),
        recommendations=scores_data.get("recommendations", [])
    )
    db.add(db_score)
    db.commit()
    
    # Create empty SkillAnalysis placeholder linked to resume
    db_skills_analysis = SkillAnalysis(
        resume_id=db_resume.id,
        user_id=current_user.id,
        missing_skills=[],
        weak_skills=[],
        recommended_skills=[],
        suggestions=[]
    )
    db.add(db_skills_analysis)
    db.commit()
    
    return {
        "resume": {
            "id": db_resume.id,
            "filename": db_resume.filename,
            "parsed_skills": db_resume.parsed_skills,
            "parsed_education": db_resume.parsed_education,
            "parsed_projects": db_resume.parsed_projects,
            "parsed_certifications": db_resume.parsed_certifications,
            "parsed_experience": db_resume.parsed_experience
        },
        "score": scores_data
    }

@router.get("/latest")
def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the user's latest uploaded resume and score data.
    """
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first."
        )
        
    scores = db.query(ResumeScore).filter(ResumeScore.resume_id == resume.id).first()
    
    return {
        "resume": {
            "id": resume.id,
            "filename": resume.filename,
            "parsed_skills": resume.parsed_skills,
            "parsed_education": resume.parsed_education,
            "parsed_projects": resume.parsed_projects,
            "parsed_certifications": resume.parsed_certifications,
            "parsed_experience": resume.parsed_experience,
            "created_at": resume.created_at
        },
        "score": scores
    }
