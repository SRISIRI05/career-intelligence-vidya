import json
import re
from typing import Dict, Any, List
from .base_agent import BaseAgent

# Database of standard roles and required skills for robust fallback
ROLE_SKILLS_MATRIX = {
    "data scientist": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn", "Statistics", "Data Visualization"],
    "data analyst": ["SQL", "Excel", "Tableau", "PowerBI", "Python", "Statistics", "Data Cleaning"],
    "ml engineer": ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Docker", "MLOps", "Git", "Scikit-Learn"],
    "bi developer": ["SQL", "PowerBI", "Tableau", "ETL", "Data Warehousing", "Data Modeling"],
    "cloud engineer": ["AWS", "Terraform", "Linux", "Docker", "Kubernetes", "Networking", "Bash", "Git"],
    "devops engineer": ["Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Terraform", "Linux", "AWS", "Bash"],
    "aws engineer": ["AWS", "IAM", "EC2", "S3", "CloudFormation", "Lambda", "VPC", "CloudWatch"],
    "sre": ["Linux", "Python", "Bash", "Prometheus", "Grafana", "Docker", "Kubernetes", "AWS", "Networking"],
    "full stack developer": ["React.js", "Node.js", "JavaScript", "HTML5", "CSS3", "Express", "MongoDB", "SQL", "Git", "Tailwind CSS"],
    "cyber security analyst": ["Networking", "Firewalls", "SIEM", "Penetration Testing", "Linux", "Cryptography", "Python"],
    "software engineer": ["Python", "Java", "C++", "Data Structures", "Algorithms", "Git", "SQL", "Docker"],
    "product manager": ["Product Roadmap", "Agile", "User Research", "Wireframing", "A/B Testing", "Jira", "Product Strategy"],
    "business analyst": ["SQL", "Excel", "PowerBI", "Tableau", "Statistics", "Requirements Gathering", "Data Visualization"]
}

class SkillAgent(BaseAgent):
    def analyze_gaps(self, resume_skills: List[str], target_role: str) -> Dict[str, Any]:
        """
        Compares resume skills with standard role requirements to identify:
        missing_skills, weak_skills, recommended_skills, and suggestions.
        """
        system_instruction = (
            "You are an expert Career Advisor and Skills Analyst. Compare the user's resume skills "
            "against the target job role. Provide a JSON response with keys: "
            "'missing_skills' (skills crucial for the role but not on the resume), "
            "'weak_skills' (skills present but which the user should strengthen), "
            "'recommended_skills' (extra skills that would make the profile stand out), "
            "and 'suggestions' (a list of action items to bridge the gap). "
            "Output ONLY valid raw JSON."
        )
        
        prompt = (
            f"User Resume Skills: {json.dumps(resume_skills)}\n"
            f"Target Role: {target_role}"
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
                    
        # Rule-based fallback
        return self._rule_based_analysis(resume_skills, target_role)

    def evaluate_eligibility(self, resume_skills: List[str], education: List[Dict[str, Any]], 
                             projects: List[Dict[str, Any]], certifications: List[str], 
                             target_role: str) -> Dict[str, Any]:
        """
        Gives a comprehensive evaluation summary, match percentage, and boolean eligibility.
        """
        # 1. Gap analysis
        gap = self.analyze_gaps(resume_skills, target_role)
        
        # 2. Score calculation
        missing = len(gap["missing_skills"])
        total_req = max(len(gap["missing_skills"]) + len(resume_skills), 8)
        
        # Simple match metric
        matched = [s for s in resume_skills if s.lower() in [r.lower() for r in ROLE_SKILLS_MATRIX.get(target_role.lower(), [])]]
        match_pct = int((len(matched) / max(len(ROLE_SKILLS_MATRIX.get(target_role.lower(), ["mock"])), 1)) * 100)
        match_pct = max(min(match_pct, 100), 25) # min 25% for custom roles
        
        eligible = match_pct >= 65
        
        summary = (
            f"Based on our evaluation, your profile has a {match_pct}% compatibility match for the '{target_role}' role. "
            f"You possess key strengths in {', '.join(matched[:3]) if matched else 'basic foundational items'}. "
            f"To become highly competitive, focusing on acquiring {', '.join(gap['missing_skills'][:3]) if gap['missing_skills'] else 'advanced technical practices'} is recommended."
        )
        
        return {
            "eligible": eligible,
            "match_percentage": match_pct,
            "matched_skills": matched if matched else ["Foundations"],
            "missing_skills": gap["missing_skills"],
            "evaluation_summary": summary,
            "suggestions": gap["suggestions"]
        }

    def _rule_based_analysis(self, resume_skills: List[str], target_role: str) -> Dict[str, Any]:
        role_key = target_role.lower()
        
        # Find matching role in db, or use a default one
        req_skills = None
        for key in ROLE_SKILLS_MATRIX:
            if key in role_key or role_key in key:
                req_skills = ROLE_SKILLS_MATRIX[key]
                break
                
        if not req_skills:
            # Custom domain default skills fallback
            req_skills = ["Git", "SQL", "Docker", "Problem Solving", "System Design", "Agile Methodologies"]
            
        resume_skills_lower = [s.lower() for s in resume_skills]
        
        matched_skills = []
        missing_skills = []
        
        for req in req_skills:
            if req.lower() in resume_skills_lower:
                matched_skills.append(req)
            else:
                missing_skills.append(req)
                
        # Weak skills are some of the matched skills that could be strengthened
        weak_skills = matched_skills[:1] if len(matched_skills) > 1 else []
        
        # Recommended skills are adjacent skills
        recommended_skills = ["System Architecture", "CI/CD Automation", "Technical Writing"]
        if "AWS" in req_skills or "Cloud" in target_role:
            recommended_skills.append("Kubernetes Orchestration")
        elif "Python" in req_skills or "Data" in target_role:
            recommended_skills.append("MLOps & Cloud Deployment")
            
        suggestions = [
            f"Learn and build a project using: {', '.join(missing_skills[:3])}.",
            "Incorporate unit tests and continuous integration logs in your portfolio projects.",
            "Consolidate your credentials by pursuing formal certification in your target domain.",
            "Refine your GitHub profile readmes to explain the system design choices of your code."
        ]
        
        return {
            "missing_skills": missing_skills if missing_skills else ["Advanced Custom Frameworks"],
            "weak_skills": weak_skills if weak_skills else ["Code Optimization"],
            "recommended_skills": recommended_skills,
            "suggestions": suggestions
        }
