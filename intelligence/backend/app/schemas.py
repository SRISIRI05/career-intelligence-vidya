from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# ================= AUTH SCHEMAS =================
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None


# ================= RESUME SCHEMAS =================
class ResumeParseResponse(BaseModel):
    id: str
    filename: Optional[str]
    parsed_skills: List[str]
    parsed_education: List[Dict[str, Any]]
    parsed_projects: List[Dict[str, Any]]
    parsed_certifications: List[str]
    parsed_experience: List[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResumeScoreResponse(BaseModel):
    ats_score: int
    technical_score: int
    communication_score: int
    projects_score: int
    certifications_score: int
    experience_score: int
    overall_score: int
    recommendations: List[str]
    
    class Config:
        from_attributes = True


# ================= SKILL SCHEMAS =================
class SkillAnalysisResponse(BaseModel):
    missing_skills: List[str]
    weak_skills: List[str]
    recommended_skills: List[str]
    suggestions: List[str]
    
    class Config:
        from_attributes = True


# ================= ELIGIBILITY SCHEMAS =================
class EligibilityCheckRequest(BaseModel):
    domain: str
    role: str

class EligibilityCheckResponse(BaseModel):
    eligible: bool
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    evaluation_summary: str
    suggestions: List[str]


# ================= LEARNING PLAN SCHEMAS =================
class LearningPlanCreateRequest(BaseModel):
    domain: str
    role: str

class LearningPlanResponse(BaseModel):
    id: str
    domain: str
    role: str
    roadmap: Dict[str, Any] # Month 1, Month 2, Month 3 structured JSON
    created_at: datetime
    
    class Config:
        from_attributes = True


# ================= RESOURCE SCHEMAS =================
class YouTubeVideo(BaseModel):
    id: str
    title: str
    thumbnail: str
    channel: str
    duration: str

class GoogleResource(BaseModel):
    title: str
    url: str
    snippet: str

class ResourcesResponse(BaseModel):
    youtube_videos: List[YouTubeVideo]
    google_links: List[GoogleResource]
    pexels_images: List[str]


# ================= QUIZ SCHEMAS =================
class QuizCreateRequest(BaseModel):
    domain: str
    difficulty: str = "Intermediate" # Beginner, Intermediate, Advanced
    question_count: int = 10 # 10, 20, 30
    question_type: str = "MCQ" # MCQ, Scenario Based

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_option: str # or index
    scenario: Optional[str] = None

class QuizSubmissionRequest(BaseModel):
    domain: str
    difficulty: str
    questions: List[Dict[str, Any]]
    answers: List[str]

class QuizEvaluationResponse(BaseModel):
    score: int
    total: int
    accuracy: float
    feedback: str
    answers_evaluation: List[Dict[str, Any]] # detail on correct/wrong answers


# ================= INTERVIEW SCHEMAS =================
class InterviewStartRequest(BaseModel):
    role: str
    type: str = "Technical" # Technical, HR, Behavioral

class InterviewStartResponse(BaseModel):
    session_id: str
    first_question: str

class InterviewMessageRequest(BaseModel):
    session_id: str
    user_answer: str

class InterviewMessageResponse(BaseModel):
    ai_response: str
    is_finished: bool

class InterviewEvaluateRequest(BaseModel):
    session_id: str

class InterviewEvaluationResponse(BaseModel):
    overall_score: int
    communication: int
    technical_accuracy: int
    confidence: int
    problem_solving: int
    clarity: int
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]


# ================= DASHBOARD & PROGRESS SCHEMAS =================
class ActivityItem(BaseModel):
    date: str
    role: str
    type: str
    score: str

class ProgressResponse(BaseModel):
    resume_score: int
    skill_match_score: int
    avg_quiz_score: int
    avg_interview_score: int
    learning_completion_rate: int
    timeline: List[Dict[str, Any]]
    next_actions: List[str]
    quiz_history: List[ActivityItem]
    interview_history: List[ActivityItem]

    class Config:
        from_attributes = True


# ================= JOB SCHEMAS =================
class JobMatch(BaseModel):
    company: str
    role: str
    salary_range: str
    location: str
    skills_required: List[str]
    match_score: int
    apply_url: str

class JobRecommendationsResponse(BaseModel):
    recommendations: List[JobMatch]


# ================= NEWS SCHEMAS =================
class NewsItem(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    description: Optional[str] = None

class NewsResponse(BaseModel):
    domain: str
    news: List[NewsItem]
