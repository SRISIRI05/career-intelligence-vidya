-- VidyaMitra Supabase PostgreSQL Schema Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RESUMES TABLE
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    file_content_text TEXT,
    file_url VARCHAR(512),
    parsed_skills JSONB DEFAULT '[]'::jsonb,
    parsed_education JSONB DEFAULT '[]'::jsonb,
    parsed_projects JSONB DEFAULT '[]'::jsonb,
    parsed_certifications JSONB DEFAULT '[]'::jsonb,
    parsed_experience JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RESUME_SCORES TABLE
CREATE TABLE IF NOT EXISTS resume_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ats_score INT DEFAULT 0,
    technical_score INT DEFAULT 0,
    communication_score INT DEFAULT 0,
    projects_score INT DEFAULT 0,
    certifications_score INT DEFAULT 0,
    experience_score INT DEFAULT 0,
    overall_score INT DEFAULT 0,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SKILL_ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS skill_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    weak_skills JSONB DEFAULT '[]'::jsonb,
    recommended_skills JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LEARNING_PLANS TABLE
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    roadmap JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- QUIZ_RESULTS TABLE
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INT DEFAULT 0,
    accuracy FLOAT DEFAULT 0.0,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INTERVIEW_RESULTS TABLE
CREATE TABLE IF NOT EXISTS interview_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Technical, HR, Behavioral
    transcript JSONB DEFAULT '[]'::jsonb,
    scores JSONB DEFAULT '{}'::jsonb, -- communication, technical accuracy, confidence, problem solving, clarity
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PROGRESS TABLE
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_score INT DEFAULT 0,
    skill_match_score INT DEFAULT 0,
    avg_quiz_score INT DEFAULT 0,
    avg_interview_score INT DEFAULT 0,
    learning_completion_rate INT DEFAULT 0,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- JOB_RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RESOURCES TABLE (CACHED)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(255) UNIQUE NOT NULL,
    resources JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NEWS TABLE (CACHED)
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    news_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
