import requests
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..auth import get_current_user
from ..config import settings
from ..schemas import ResourcesResponse

router = APIRouter(
    prefix="/resources",
    tags=["resources"]
)

# Robust fallback database for offline/demo reliability
MOCK_RESOURCES = {
    "ai/ml": {
        "youtube": [
            {
                "id": "aircAruvnKk",
                "title": "But what is a neural network? | Chapter 1, Deep learning",
                "thumbnail": "https://img.youtube.com/vi/aircAruvnKk/0.jpg",
                "channel": "3Blue1Brown",
                "duration": "20:00"
            },
            {
                "id": "i_LwzRVP7bg",
                "title": "Machine Learning Zoomcamp - Practical introduction to ML pipelines",
                "thumbnail": "https://img.youtube.com/vi/i_LwzRVP7bg/0.jpg",
                "channel": "Alexey Grigorev",
                "duration": "1:15:30"
            },
            {
                "id": "VMj-3S1tku0",
                "title": "FastAPI Course for Beginners - Build and Deploy APIs with Python",
                "thumbnail": "https://img.youtube.com/vi/VMj-3S1tku0/0.jpg",
                "channel": "freeCodeCamp.org",
                "duration": "2:40:15"
            }
        ],
        "google": [
            {
                "title": "Scikit-Learn Official Documentation & User Guide",
                "url": "https://scikit-learn.org/stable/user_guide.html",
                "snippet": "Provides complete instructions, code templates and tutorials on classification, regression, clustering and preprocessing pipelines."
            },
            {
                "title": "PyTorch Tutorials - Getting Started with Neural Architecture",
                "url": "https://pytorch.org/tutorials/",
                "snippet": "Learn PyTorch step-by-step with interactive coding notebooks explaining tensors, auto-differentiation, and model serving."
            },
            {
                "title": "MLOps Roadmap: Productionizing ML Systems",
                "url": "https://github.com/GokuMohandas/MadeWithML",
                "snippet": "Learn how to combine machine learning with software engineering (design, code, test, deploy, monitor) to build production ML systems."
            }
        ],
        "pexels": [
            "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=600"
        ]
    },
    "general": {
        "youtube": [
            {
                "id": "W6NZfCO5SIk",
                "title": "JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour",
                "thumbnail": "https://img.youtube.com/vi/W6NZfCO5SIk/0.jpg",
                "channel": "Programming with Mosh",
                "duration": "48:16"
            },
            {
                "id": "zkz25_y4zN0",
                "title": "Docker Crash Course for Beginners - Containerize Your Apps",
                "thumbnail": "https://img.youtube.com/vi/zkz25_y4zN0/0.jpg",
                "channel": "TechWorld with Nana",
                "duration": "2:05:40"
            },
            {
                "id": "RBSGKlAboiM",
                "title": "System Design Basics: Monoliths vs. Microservices",
                "thumbnail": "https://img.youtube.com/vi/RBSGKlAboiM/0.jpg",
                "channel": "ByteByteGo",
                "duration": "12:30"
            }
        ],
        "google": [
            {
                "title": "MDN Web Docs - HTML, CSS, & Modern JS",
                "url": "https://developer.mozilla.org/en-US/",
                "snippet": "Comprehensive specifications, syntax references and interactive code playgrounds for core web technology stacks."
            },
            {
                "title": "FastAPI Web Framework - Fast and Intuitive Documentation",
                "url": "https://fastapi.tiangolo.com/",
                "snippet": "Official FastAPI website explaining dynamic schema verification, auto-generated OpenAPI documentation, and asynchronous server routes."
            },
            {
                "title": "Git and GitHub workflows - Collaboration Guide",
                "url": "https://docs.github.com/en/get-started",
                "snippet": "Master branch branching models, remote staging procedures, conflict resolution and pipeline checks."
            }
        ],
        "pexels": [
            "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600"
        ]
    }
}

@router.get("", response_model=ResourcesResponse)
def get_external_resources(
    role: str = Query(..., description="Target job role"),
    domain: str = Query(..., description="Target career domain")
):
    """
    Queries YouTube, Google Search, and Pexels APIs for tutorials, documentations, and images.
    Falls back to pre-selected mock entries if API keys are missing.
    """
    yt_videos = []
    google_links = []
    pexels_urls = []
    
    domain_key = "general"
    if "ai" in domain.lower() or "ml" in domain.lower() or "data" in domain.lower():
        domain_key = "ai/ml"
        
    # ================= 1. YOUTUBE API SEARCH =================
    if settings.YOUTUBE_API_KEY:
        try:
            search_query = f"{role} tutorials course interview"
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": search_query,
                "maxResults": 3,
                "type": "video",
                "key": settings.YOUTUBE_API_KEY
            }
            res = requests.get(url, params=params, timeout=5).json()
            for item in res.get("items", []):
                vid_id = item["id"]["videoId"]
                snippet = item["snippet"]
                yt_videos.append({
                    "id": vid_id,
                    "title": snippet["title"],
                    "thumbnail": snippet["thumbnails"]["medium"]["url"],
                    "channel": snippet["channelTitle"],
                    "duration": "15:00" # YouTube search doesn't return duration, require video details call
                })
        except Exception:
            pass
            
    if not yt_videos:
        yt_videos = MOCK_RESOURCES[domain_key]["youtube"]
        
    # ================= 2. GOOGLE SEARCH API =================
    if settings.GOOGLE_SEARCH_API_KEY and settings.GOOGLE_CSE_ID:
        try:
            search_query = f"{role} documentation blog tutorials guide"
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "q": search_query,
                "num": 3,
                "key": settings.GOOGLE_SEARCH_API_KEY,
                "cx": settings.GOOGLE_CSE_ID
            }
            res = requests.get(url, params=params, timeout=5).json()
            for item in res.get("items", []):
                google_links.append({
                    "title": item["title"],
                    "url": item["link"],
                    "snippet": item.get("snippet", "")
                })
        except Exception:
            pass
            
    if not google_links:
        google_links = MOCK_RESOURCES[domain_key]["google"]
        
    # ================= 3. PEXELS API =================
    if settings.PEXELS_API_KEY:
        try:
            search_query = f"{domain} technology"
            url = f"https://api.pexels.com/v1/search?query={search_query}&per_page=3"
            headers = {"Authorization": settings.PEXELS_API_KEY}
            res = requests.get(url, headers=headers, timeout=5).json()
            for photo in res.get("photos", []):
                pexels_urls.append(photo["src"]["medium"])
        except Exception:
            pass
            
    if not pexels_urls:
        pexels_urls = MOCK_RESOURCES[domain_key]["pexels"]
        
    return {
        "youtube_videos": yt_videos,
        "google_links": google_links,
        "pexels_images": pexels_urls
    }
