import json
import re
from typing import Dict, Any, List
from .base_agent import BaseAgent

class PlannerAgent(BaseAgent):
    def generate_roadmap(self, target_role: str, missing_skills: List[str]) -> Dict[str, Any]:
        """
        Generates a structured 3-month roadmap for the user to transition into target_role,
        addressing their missing_skills.
        """
        system_instruction = (
            "You are a Senior Learning and Development Specialist. Generate a personalized 3-month "
            "learning plan for transitioning into the target job role, specifically addressing the missing skills. "
            "Provide the output strictly in JSON format matching this structure:\n"
            "{\n"
            "  \"title\": \"Roadmap Title\",\n"
            "  \"timeline\": \"3 Months\",\n"
            "  \"month_1\": {\n"
            "    \"focus\": \"Core Theory & Foundations\",\n"
            "    \"topics\": [\"topic1\", \"topic2\"],\n"
            "    \"practice_tasks\": [\"task1\", \"task2\"],\n"
            "    \"resources\": [\"resource1\", \"resource2\"]\n"
            "  },\n"
            "  \"month_2\": {\n"
            "    \"focus\": \"Advanced Architecture & Intermediate Work\",\n"
            "    \"topics\": [\"topic1\", \"topic2\"],\n"
            "    \"projects\": [\"project1\", \"project2\"],\n"
            "    \"resources\": [\"resource1\", \"resource2\"]\n"
            "  },\n"
            "  \"month_3\": {\n"
            "    \"focus\": \"Interview Preparation & Portfolio Polish\",\n"
            "    \"topics\": [\"topic1\", \"topic2\"],\n"
            "    \"interview_prep\": [\"task1\", \"task2\"],\n"
            "    \"resources\": [\"resource1\", \"resource2\"]\n"
            "  }\n"
            "}\n"
            "Output ONLY valid raw JSON."
        )
        
        prompt = (
            f"Target Role: {target_role}\n"
            f"Missing Skills to cover: {json.dumps(missing_skills)}"
        )
        
        if self.has_llm:
            result = self.run_prompt(prompt, system_instruction)
            if result:
                try:
                    cleaned = re.sub(r"```json\s*", "", result)
                    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
                    return json.loads(cleaned)
                except Exception:
                    pass
                    
        # Robust demo fallback roadmaps
        return self._generate_fallback_roadmap(target_role, missing_skills)

    def _generate_fallback_roadmap(self, target_role: str, missing_skills: List[str]) -> Dict[str, Any]:
        role_lower = target_role.lower()
        skills_str = ", ".join(missing_skills[:3]) if missing_skills else "advanced concepts"
        
        if "data" in role_lower or "ml" in role_lower or "ai" in role_lower:
            return {
                "title": f"Custom Accelerated Path to {target_role}",
                "timeline": "3 Months",
                "month_1": {
                    "focus": f"Mathematical foundations & Advanced {skills_str}",
                    "topics": [
                        "Data structures and database schema design",
                        "Statistical models and exploratory data analysis (EDA)",
                        "SQL aggregation queries & data warehousing setups"
                    ],
                    "practice_tasks": [
                        "Build SQL analytics queries parsing 100k+ customer transactions.",
                        "Write mathematical linear regression calculations from scratch in Python."
                    ],
                    "resources": [
                        "Coursera Career Coach: Statistics and Exploratory Analysis",
                        "YouTube: Python for Data Science and Machine Learning Bootcamps"
                    ]
                },
                "month_2": {
                    "focus": "Machine Learning Models & Scalable Pipelines",
                    "topics": [
                        "Scikit-Learn models, hyperparameter tuning",
                        "Deep learning frameworks (PyTorch and TensorFlow foundations)",
                        "Data pipelines, cleaning anomalies, ETL procedures"
                    ],
                    "projects": [
                        "House Price Predictor: Clean, evaluate and tune a random forest regression model.",
                        "Customer Segmentation Engine: Multi-dimensional clustering using K-Means and PCA."
                    ],
                    "resources": [
                        "Fast.ai Practical Deep Learning course",
                        "Google Search: MLOps best practices and Scikit-Learn guides"
                    ]
                },
                "month_3": {
                    "focus": "Model Deployments & Interview Training",
                    "topics": [
                        "REST APIs building using FastAPI or Flask for model serving",
                        "Docker containerization of services",
                        "Mock coding tests and system architecture questions"
                    ],
                    "interview_prep": [
                        "Solve 20 medium algorithmic coding challenges on arrays and trees.",
                        "Design end-to-end model ingestion architecture during interactive drills."
                    ],
                    "resources": [
                        "InterviewBit: ML Engineering Coding Questions",
                        "VidyaMitra Mock Interview simulator"
                    ]
                }
            }
        
        # General/Software Engineering/Web Development roadmap default
        return {
            "title": f"Complete Training Roadmap for {target_role}",
            "timeline": "3 Months",
            "month_1": {
                "focus": f"Core Architectures & Mastering {skills_str}",
                "topics": [
                    "Version control, git workflows and team collaboration",
                    "Programming foundations, algorithms and OOP principles",
                    "Database designs, SQL schemas and REST API standards"
                ],
                "practice_tasks": [
                    "Implement 5 classic sorting/searching algorithms from scratch.",
                    "Build a fully-validated REST CRUD API using FastAPI or Express."
                ],
                "resources": [
                    "MDN Web Docs: JavaScript / Backend guide",
                    "YouTube: Git and GitHub Masterclass"
                ]
            },
            "month_2": {
                "focus": "Advanced Systems Integration & DevOps",
                "topics": [
                    "Docker containerization, environment isolations",
                    "Client-side state management (Redux, Context API, Hooks)",
                    "Continuous Integration / Continuous Deployment (CI/CD) pipelines"
                ],
                "projects": [
                    "Full-Stack Platform: Complete user authentication, CRUD operations and DB storage.",
                    "Automated DevOps Pipeline: Push code to trigger dockerized test suites and staging deploy."
                ],
                "resources": [
                    "Architecting Web Solutions - Udemy",
                    "Google Search: Tailwind CSS & React routing patterns"
                ]
            },
            "month_3": {
                "focus": "System Design & Interview Success",
                "topics": [
                    "Microservices vs Monolith architectures",
                    "Caching structures (Redis) & performance load tests",
                    "HR and behavioral interview templates"
                ],
                "interview_prep": [
                    "Revisit mock whiteboard system design layouts.",
                    "Take 3 complete technical mock interviews focusing on speech clarity and confidence."
                ],
                "resources": [
                    "InterviewBit: Frontend & Fullstack Coding Drills",
                    "VidyaMitra AI Interview Simulator Room"
                ]
            }
        }
