import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    JWT_SECRET: str = "vidyamitrasupersecretjwttokenfordevelopmentpurposeonly98765"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = ""
    OPENAI_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""
    GOOGLE_SEARCH_API_KEY: str = ""
    GOOGLE_CSE_ID: str = ""
    PEXELS_API_KEY: str = ""
    NEWS_API_KEY: str = ""
    EXCHANGE_RATE_API_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    class Config:
        # Check current dir or parent dir for .env file
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

