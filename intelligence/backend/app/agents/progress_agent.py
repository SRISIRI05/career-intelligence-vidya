import json
from typing import Dict, Any, List
from .base_agent import BaseAgent

class ProgressAgent(BaseAgent):
    def generate_next_actions(self, resume_score: int, avg_quiz_score: int, 
                              avg_interview_score: int, roadmap_exists: bool) -> List[str]:
        """
        Calculates dynamic personal development recommendations based on current profile metrics.
        """
        actions = []
        
        if resume_score < 70:
            actions.append("Upload an updated resume targeting ATS keyword improvements suggested in the analysis page.")
        
        if not roadmap_exists:
            actions.append("Select your career domain and desired role to formulate your 3-Month Training Roadmap.")
        else:
            actions.append("Mark completed items in your Monthly Learning Plan and review external learning web articles.")
            
        if avg_quiz_score < 70:
            actions.append("Take a Beginner or Intermediate Domain Quiz to bolster your core concepts.")
        else:
            actions.append("Strap in and test yourself with an Advanced level scenario-based domain quiz.")
            
        if avg_interview_score == 0:
            actions.append("Enter the Mock Interview room and test your capabilities with an HR or Technical simulated chat.")
        elif avg_interview_score < 75:
            actions.append("Practice another simulated Interview session focusing on confidence and explanation structure.")
        else:
            actions.append("Excellent mock interview standing! Challenge yourself in Voice Mode with deep system questions.")
            
        if len(actions) < 3:
            actions.append("Check updated tech trends and market reports in your career domain.")
            
        return actions[:4]
