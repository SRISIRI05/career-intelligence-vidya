import requests
from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any

from ..config import settings
from ..schemas import NewsResponse

router = APIRouter(
    prefix="/news",
    tags=["news and market insights"]
)

# Static mock trending news database
MOCK_NEWS = {
    "general": [
        {
            "title": "Tech Hiring Trends in 2026: Hybrid work remains dominant",
            "source": "TechRadar",
            "url": "https://techradar.com",
            "published_at": "June 08, 2026",
            "description": "A comprehensive survey of 500 tech companies shows engineering headcount growing steadily, with hybrid and remote roles leading the pack."
        },
        {
            "title": "Top Tech Skills Demanded by Global Employers",
            "source": "InfoQ",
            "url": "https://infoq.com",
            "published_at": "June 05, 2026",
            "description": "Docker containerization, REST API architectures, and Git collaboration workflows continue to be standard requirements for junior roles."
        }
    ],
    "ai/ml": [
        {
            "title": "LLM Agents Redefine Enterprise Productivity In 2026",
            "source": "TechCrunch",
            "url": "https://techcrunch.com",
            "published_at": "June 09, 2026",
            "description": "Enterprise software architectures are transitioning from standalone chat applications to autonomous planning agent structures."
        },
        {
            "title": "PyTorch 3.0 Released: Native hardware acceleration optimizations",
            "source": "VentureBeat",
            "url": "https://venturebeat.com",
            "published_at": "June 07, 2026",
            "description": "The new release focuses on accelerating training workflows on consumer GPUs and streamlining MLOps container builds."
        }
    ]
}

@router.get("", response_model=NewsResponse)
def get_domain_news(
    domain: str = Query("General", description="Target domain to filter news")
):
    """
    Fetches trending technology news filtered by domain.
    Falls back to mock tech news if News API is unconfigured.
    """
    news_list = []
    dom_key = "general"
    
    if "ai" in domain.lower() or "ml" in domain.lower() or "data" in domain.lower():
        dom_key = "ai/ml"
        
    # ================= NEWS API CALL =================
    if settings.NEWS_API_KEY:
        try:
            query = f"{domain} hiring trends technology"
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": query,
                "sortBy": "publishedAt",
                "pageSize": 3,
                "apiKey": settings.NEWS_API_KEY
            }
            res = requests.get(url, params=params, timeout=5).json()
            for article in res.get("articles", []):
                news_list.append({
                    "title": article["title"],
                    "source": article["source"].get("name", "News Source"),
                    "url": article["url"],
                    "published_at": article["publishedAt"][:10],
                    "description": article.get("description", "")
                })
        except Exception:
            pass
            
    if not news_list:
        news_list = MOCK_NEWS[dom_key]
        
    return {
        "domain": domain,
        "news": news_list
    }

@router.get("/insights")
def get_market_insights():
    """
    Queries Exchange Rate API to display currency rates and industry growth indicators.
    """
    rates = {
        "USD/INR": 83.50,
        "USD/EUR": 0.92,
        "USD/GBP": 0.78,
        "USD/CAD": 1.37
    }
    
    # ================= EXCHANGE RATE API =================
    if settings.EXCHANGE_RATE_API_KEY:
        try:
            url = f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGE_RATE_API_KEY}/latest/USD"
            res = requests.get(url, timeout=5).json()
            if res.get("result") == "success":
                conversion_rates = res.get("conversion_rates", {})
                rates = {
                    "USD/INR": round(conversion_rates.get("INR", 83.50), 2),
                    "USD/EUR": round(conversion_rates.get("EUR", 0.92), 2),
                    "USD/GBP": round(conversion_rates.get("GBP", 0.78), 2),
                    "USD/CAD": round(conversion_rates.get("CAD", 1.37), 2)
                }
        except Exception:
            pass
            
    return {
        "exchange_rates": rates,
        "market_indicators": [
            {"indicator": "AI & Automation Growth", "trend": "+24.8% YoY", "status": "Bullish"},
            {"indicator": "Cloud Infrastructure Spend", "trend": "+18.2% YoY", "status": "Strong"},
            {"indicator": "Cybersecurity Compliance Demand", "trend": "+15.6% YoY", "status": "Steady"},
            {"indicator": "Global Tech Hiring Velocity", "trend": "+6.4% MoM", "status": "Recovering"}
        ]
    }
