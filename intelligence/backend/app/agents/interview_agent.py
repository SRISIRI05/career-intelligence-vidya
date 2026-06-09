import json
import re
from typing import Dict, Any, List
from .base_agent import BaseAgent

# Database of standard starting questions by interview type
INTERVIEW_QUESTIONS = {
    "technical": [
        "Can you explain the difference between a process and a thread, and when you would use each?",
        "What is the Big O complexity of searching in a Hash Map versus a Binary Search Tree?",
        "How do you handle race conditions in an application when multiple API calls write to a shared database concurrently?",
        "Explain how memory management works in Python, particularly references and garbage collection."
    ],
    "hr": [
        "Tell me about yourself and why you want to transition into this specific job role.",
        "What are your greatest professional strengths and where do you feel you have the most room to grow?",
        "Where do you see yourself in five years, and how does this role align with those career aspirations?",
        "Why should we hire you over other candidates who might have similar technical credentials?"
    ],
    "behavioral": [
        "Tell me about a time you had a major disagreement with a team member. How did you handle it and what was the outcome?",
        "Describe a project that failed or did not meet expectations. What went wrong and what did you learn?",
        "How do you prioritize your tasks when managing multiple tight deadlines simultaneously?",
        "Can you share an experience where you had to quickly learn a new technology to solve a problem?"
    ]
}

class InterviewAgent(BaseAgent):
    def get_first_question(self, int_type: str, role: str) -> str:
        """
        Retrieves the initial interview question.
        """
        type_key = int_type.lower()
        if "hr" in type_key:
            return INTERVIEW_QUESTIONS["hr"][0]
        elif "behavior" in type_key:
            return INTERVIEW_QUESTIONS["behavior"][0]
        else:
            return f"Welcome to the technical interview for the {role} position. {INTERVIEW_QUESTIONS['technical'][0]}"

    def generate_next_response(self, role: str, int_type: str, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Takes the dialog history (transcript) and generates the next follow-up question.
        """
        system_instruction = (
            f"You are a professional hiring manager interviewing a candidate for a {role} role. "
            f"The interview type is {int_type}. Review the dialogue history, acknowledge their response "
            "thoughtfully, and ask the next natural follow-up question. "
            "Do NOT evaluate the candidate yet. Output ONLY a JSON object with keys: "
            "'ai_response' (string containing your feedback + next question) and "
            "'is_finished' (boolean, set to true ONLY if 4-5 rounds of conversation are complete)."
        )
        
        prompt = f"Interview history:\n{json.dumps(transcript[-8:], indent=2)}"
        
        if self.has_llm:
            result = self.run_prompt(prompt, system_instruction)
            if result:
                try:
                    cleaned = re.sub(r"```json\s*", "", result)
                    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
                    return json.loads(cleaned)
                except Exception:
                    pass
                    
        # Rule-based progression fallback
        return self._get_fallback_next_response(int_type, transcript)

    def evaluate_interview(self, role: str, int_type: str, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Analyzes the full conversation transcript and scores metrics:
        overall, communication, technical accuracy, confidence, problem solving, clarity.
        Provides lists of strengths, weaknesses, and recommendations.
        """
        system_instruction = (
            f"You are an expert Interview Coach. Evaluate this complete {int_type} mock interview transcript "
            f"for a {role} position. Calculate integer scores from 0-100 for: "
            "'communication', 'technical_accuracy', 'confidence', 'problem_solving', 'clarity', and 'overall_score'. "
            "List 'strengths' (array of strings), 'weaknesses' (array of strings), "
            "and 'recommendations' (array of strings). "
            "Output ONLY valid raw JSON."
        )
        
        prompt = f"Full Interview Dialogue:\n{json.dumps(transcript, indent=2)}"
        
        if self.has_llm:
            result = self.run_prompt(prompt, system_instruction)
            if result:
                try:
                    cleaned = re.sub(r"```json\s*", "", result)
                    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
                    return json.loads(cleaned)
                except Exception:
                    pass
                    
        # Fallback evaluator
        return self._evaluate_fallback(transcript)

    def _get_fallback_next_response(self, int_type: str, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
        type_key = int_type.lower()
        q_list = INTERVIEW_QUESTIONS.get("technical")
        if "hr" in type_key:
            q_list = INTERVIEW_QUESTIONS.get("hr")
        elif "behavior" in type_key:
            q_list = INTERVIEW_QUESTIONS.get("behavior")
            
        # Count user inputs to determine current stage
        user_turns = sum(1 for m in transcript if m.get("sender") == "user")
        
        is_finished = user_turns >= 4
        
        if is_finished:
            ai_response = "Thank you so much. That completes our mock interview session! I will compile your feedback metrics now."
        else:
            # Pick next question from list based on user turns count
            q_idx = min(user_turns, len(q_list) - 1)
            ai_response = f"Got it. Thanks for sharing. Next question: {q_list[q_idx]}"
            
        return {
            "ai_response": ai_response,
            "is_finished": is_finished
        }

    def _evaluate_fallback(self, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
        # Simple word count and content checking to score the transcript
        user_words = 0
        answers = []
        for m in transcript:
            if m.get("sender") == "user":
                answers.append(m.get("text", ""))
                user_words += len(m.get("text", "").split())
                
        # Base scores
        avg_answer_length = user_words / len(answers) if answers else 0
        
        comm = min(65 + int(avg_answer_length / 2), 95)
        tech = 80 if "process" in "".join(answers).lower() or "complexity" in "".join(answers).lower() else 75
        conf = 85
        prob = 80
        clarity = min(70 + int(avg_answer_length / 3), 90)
        overall = int((comm + tech + conf + prob + clarity) / 5)
        
        strengths = [
            "You answered promptly and provided good structural outlines.",
            "Demonstrated practical familiarity with core development terminology.",
            "Maintained a professional tone throughout the text dialogue."
        ]
        
        weaknesses = [
            "Answers could be more granular; some technical terms were left unelaborated.",
            "Whiteboard scenarios could benefit from step-by-step logic tracing."
        ]
        
        recommendations = [
            "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
            "Practice articulating code complexities (Big O notation) during technical responses.",
            "Explain trade-offs clearly when choosing design patterns."
        ]
        
        return {
            "overall_score": overall,
            "communication": comm,
            "technical_accuracy": tech,
            "confidence": conf,
            "problem_solving": prob,
            "clarity": clarity,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations
        }
