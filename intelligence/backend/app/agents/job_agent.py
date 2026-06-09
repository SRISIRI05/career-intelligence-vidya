import json
import re
from typing import Dict, Any, List
from .base_agent import BaseAgent

MOCK_JOBS = [
    {
        "company": "Tata Consultancy Services (TCS)",
        "role": "Machine Learning Engineer",
        "salary_range": "₹12,00,000 - ₹20,00,000 per annum",
        "location": "Bengaluru, Karnataka (Hybrid)",
        "skills_required": ["Python", "PyTorch", "TensorFlow", "Docker", "Machine Learning", "System Design"],
        "match_score": 92,
        "apply_url": "https://www.tcs.com/careers"
    },
    {
        "company": "Infosys",
        "role": "Full Stack Developer",
        "salary_range": "₹10,00,000 - ₹18,00,000 per annum",
        "location": "Hyderabad, Telangana (Hybrid)",
        "skills_required": ["React.js", "Node.js", "JavaScript", "SQL", "Git", "System Design"],
        "match_score": 88,
        "apply_url": "https://www.infosys.com/careers"
    },
    {
        "company": "Wipro Technologies",
        "role": "Cloud Infrastructure Engineer",
        "salary_range": "₹14,00,000 - ₹22,00,000 per annum",
        "location": "Pune, Maharashtra (Hybrid)",
        "skills_required": ["AWS", "Terraform", "Kubernetes", "Linux", "Bash", "Networking"],
        "match_score": 90,
        "apply_url": "https://careers.wipro.com"
    },
    {
        "company": "HCL Technologies",
        "role": "DevOps Engineer",
        "salary_range": "₹10,00,000 - ₹16,00,000 per annum",
        "location": "Chennai, Tamil Nadu (Remote)",
        "skills_required": ["Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Python", "AWS"],
        "match_score": 85,
        "apply_url": "https://www.hcltech.com/careers"
    },
    {
        "company": "Flipkart",
        "role": "Software Development Engineer",
        "salary_range": "₹18,00,000 - ₹30,00,000 per annum",
        "location": "Bengaluru, Karnataka (Hybrid)",
        "skills_required": ["React.js", "JavaScript", "Java", "Spring Boot", "Git", "Microservices"],
        "match_score": 89,
        "apply_url": "https://www.flipkartcareers.com"
    },
    {
        "company": "Zoho Corporation",
        "role": "Data Scientist",
        "salary_range": "₹12,00,000 - ₹20,00,000 per annum",
        "location": "Chennai, Tamil Nadu (On-site)",
        "skills_required": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn", "Statistics"],
        "match_score": 91,
        "apply_url": "https://careers.zohocorp.com"
    },
    {
        "company": "Swiggy",
        "role": "Backend Engineer",
        "salary_range": "₹16,00,000 - ₹26,00,000 per annum",
        "location": "Bengaluru, Karnataka (Hybrid)",
        "skills_required": ["Python", "Go", "Microservices", "Kafka", "Redis", "SQL", "Docker"],
        "match_score": 87,
        "apply_url": "https://bytes.swiggy.com/careers"
    },
    {
        "company": "Razorpay",
        "role": "Frontend Engineer",
        "salary_range": "₹15,00,000 - ₹25,00,000 per annum",
        "location": "Bengaluru, Karnataka (Hybrid)",
        "skills_required": ["React.js", "JavaScript", "TypeScript", "CSS3", "HTML5", "Git"],
        "match_score": 86,
        "apply_url": "https://razorpay.com/jobs"
    }
]

class JobAgent(BaseAgent):
    def recommend_jobs(self, domain: str, skills: List[str]) -> List[Dict[str, Any]]:
        """
        Recommends job openings matching the user's skillset and desired domain.
        """
        system_instruction = (
            "You are an expert Job Matcher for the Indian job market. Recommend 4-5 job postings from Indian companies "
            "matching the candidate's domain and technical skills. Use Indian companies like TCS, Infosys, Wipro, HCL, "
            "Flipkart, Swiggy, Zomato, Razorpay, Zoho, PhonePe, CRED, Paytm, Ola, Meesho, etc. "
            "Salary ranges must be in Indian Rupees (₹ per annum). Locations must be Indian cities like "
            "Bengaluru, Hyderabad, Pune, Chennai, Mumbai, Delhi, Noida, Gurgaon. "
            "Return a JSON array of objects, each object containing: "
            "'company' (string), 'role' (string), 'salary_range' (string), 'location' (string), "
            "'skills_required' (array of strings), 'match_score' (integer 0-100), and 'apply_url' (string). "
            "Output ONLY valid raw JSON."
        )
        
        prompt = (
            f"Candidate Domain: {domain}\n"
            f"Skills: {json.dumps(skills)}"
        )
        
        if self.has_llm:
            result = self.run_prompt(prompt, system_instruction)
            if result:
                try:
                    cleaned = re.sub(r"```json\s*", "", result)
                    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
                    parsed = json.loads(cleaned)
                    if isinstance(parsed, list) and len(parsed) > 0:
                        return parsed
                except Exception:
                    pass
                    
        # Robust template recommendations based on domain match
        return self._get_fallback_jobs(domain, skills)

    def _get_fallback_jobs(self, domain: str, skills: List[str]) -> List[Dict[str, Any]]:
        domain_lower = domain.lower()
        skills_lower = [s.lower() for s in skills]
        
        matches = []
        for job in MOCK_JOBS:
            # Score match score dynamically based on skills shared
            reqs = [r.lower() for r in job["skills_required"]]
            shared = [s for s in skills_lower if s in reqs]
            
            # Dynamic matching score calculation
            score = int((len(shared) / max(len(reqs), 1)) * 60) + 40 # minimum 40% match
            job_copy = job.copy()
            job_copy["match_score"] = min(score, 98)
            
            # Prioritize matching jobs by domain keyword
            if (
                ("data" in domain_lower and "data" in job["role"].lower()) or
                ("ml" in domain_lower and "machine" in job["role"].lower()) or
                ("cloud" in domain_lower and "cloud" in job["role"].lower()) or
                ("devops" in domain_lower and "devops" in job["role"].lower()) or
                ("full stack" in domain_lower and "full stack" in job["role"].lower()) or
                ("software" in domain_lower and "software" in job["role"].lower())
            ):
                matches.insert(0, job_copy) # Insert at front
            else:
                matches.append(job_copy)
                
        return matches[:4]
