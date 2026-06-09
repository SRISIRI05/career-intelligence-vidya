import uuid
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    resume_scores = relationship("ResumeScore", back_populates="user", cascade="all, delete-orphan")
    skill_analyses = relationship("SkillAnalysis", back_populates="user", cascade="all, delete-orphan")
    learning_plans = relationship("LearningPlan", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    interview_results = relationship("InterviewResult", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    job_recommendations = relationship("JobRecommendation", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255))
    file_content_text = Column(Text)
    file_url = Column(String(512), nullable=True)

    
    # Stored as JSON lists
    parsed_skills = Column(JSON, default=list)
    parsed_education = Column(JSON, default=list)
    parsed_projects = Column(JSON, default=list)
    parsed_certifications = Column(JSON, default=list)
    parsed_experience = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="resumes")
    scores = relationship("ResumeScore", back_populates="resume", cascade="all, delete-orphan")
    skill_analyses = relationship("SkillAnalysis", back_populates="resume", cascade="all, delete-orphan")


class ResumeScore(Base):
    __tablename__ = "resume_scores"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    ats_score = Column(Integer, default=0)
    technical_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    projects_score = Column(Integer, default=0)
    certifications_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)
    recommendations = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="resume_scores")
    resume = relationship("Resume", back_populates="scores")


class SkillAnalysis(Base):
    __tablename__ = "skill_analysis"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    missing_skills = Column(JSON, default=list)
    weak_skills = Column(JSON, default=list)
    recommended_skills = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="skill_analyses")
    resume = relationship("Resume", back_populates="skill_analyses")


class LearningPlan(Base):
    __tablename__ = "learning_plans"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    roadmap = Column(JSON, nullable=False, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="learning_plans")


class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False)
    
    questions = Column(JSON, nullable=False, default=list)
    answers = Column(JSON, nullable=False, default=list)
    score = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    feedback = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="quiz_results")


class InterviewResult(Base):
    __tablename__ = "interview_results"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)  # Technical, HR, Behavioral
    
    transcript = Column(JSON, default=list)
    scores = Column(JSON, default=dict)  # communication, technical_accuracy, confidence, problem_solving, clarity, overall
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="interview_results")


class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    resume_score = Column(Integer, default=0)
    skill_match_score = Column(Integer, default=0)
    avg_quiz_score = Column(Integer, default=0)
    avg_interview_score = Column(Integer, default=0)
    learning_completion_rate = Column(Integer, default=0)
    timeline = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="progress_records")


class JobRecommendation(Base):
    __tablename__ = "job_recommendations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recommendations = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="job_recommendations")


class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(String(255), unique=True, nullable=False)
    resources = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class News(Base):
    __tablename__ = "news"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain = Column(String(255), unique=True, nullable=False)
    news_items = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
