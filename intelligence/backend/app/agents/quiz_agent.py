import json
import re
import random
from typing import Dict, Any, List
from .base_agent import BaseAgent

# Local database of high-quality mock questions for offline/demo robustness
MOCK_QUESTION_BANK = {
    "ai/ml": {
        "Beginner": [
            {
                "id": 1,
                "question": "What is the primary goal of supervised learning?",
                "options": [
                    "To cluster unlabeled data points.",
                    "To learn a mapping from input variables to output variables based on labeled training data.",
                    "To allow an agent to learn actions in an environment via reinforcement rewards.",
                    "To generate new images from scratch."
                ],
                "correct_option": "To learn a mapping from input variables to output variables based on labeled training data."
            },
            {
                "id": 2,
                "question": "Which Python library is most commonly used for basic scientific computation, offering multi-dimensional array support?",
                "options": ["Flask", "NumPy", "Django", "Pillow"],
                "correct_option": "NumPy"
            },
            {
                "id": 3,
                "question": "Scenario: You want to predict whether an email is spam or not. What type of machine learning task is this?",
                "options": ["Regression", "Clustering", "Classification", "Dimensionality Reduction"],
                "correct_option": "Classification",
                "scenario": "A company wants to filter inbound sales emails to separate legitimate inquiries from automated spam advertisements."
            }
        ],
        "Intermediate": [
            {
                "id": 1,
                "question": "What is the purpose of a validation dataset in machine learning?",
                "options": [
                    "To train the model weight parameters directly.",
                    "To test the model's performance on final production systems.",
                    "To tune model hyperparameters and prevent overfitting on training data.",
                    "To format the raw input text."
                ],
                "correct_option": "To tune model hyperparameters and prevent overfitting on training data."
            },
            {
                "id": 2,
                "question": "What does a ROC curve measure?",
                "options": [
                    "The relationship between epoch number and loss rate.",
                    "The trade-off between True Positive Rate and False Positive Rate across classification thresholds.",
                    "The cluster separation distance in unsupervised K-Means.",
                    "The memory usage profile of PyTorch neural layers."
                ],
                "correct_option": "The trade-off between True Positive Rate and False Positive Rate across classification thresholds."
            },
            {
                "id": 3,
                "question": "Scenario: Your neural network model has extremely high training accuracy but poor test accuracy. What is happening and how do you fix it?",
                "options": [
                    "Underfitting; increase the network size and remove dropout layers.",
                    "Overfitting; apply regularization (e.g., L2 or dropout) and collect more data.",
                    "Vanishing gradients; replace ReLU activations with Sigmoid.",
                    "Data leakage; merge the validation set into the test set."
                ],
                "correct_option": "Overfitting; apply regularization (e.g., L2 or dropout) and collect more data.",
                "scenario": "A convolutional network predicting cat breeds scores 99% accuracy on the training catalog, but only 54% accuracy on customer uploads."
            }
        ]
    },
    "full stack development": {
        "Beginner": [
            {
                "id": 1,
                "question": "Which HTML tag is used to reference external JavaScript code files?",
                "options": ["<link>", "<script>", "<js>", "<style>"],
                "correct_option": "<script>"
            },
            {
                "id": 2,
                "question": "What is React's Virtual DOM primarily used for?",
                "options": [
                    "Running tests in server environments.",
                    "Optimizing DOM manipulation by updating only changed components in the browser.",
                    "Connecting to remote relational databases.",
                    "Implementing OAuth login steps."
                ],
                "correct_option": "Optimizing DOM manipulation by updating only changed components in the browser."
            },
            {
                "id": 3,
                "question": "Scenario: You need a layout style where boxes wrap gracefully and stretch/align easily on different mobile sizes. Which CSS tool is best?",
                "options": ["Floats", "Absolute positioning", "CSS Flexbox or CSS Grid", "Inline elements"],
                "correct_option": "CSS Flexbox or CSS Grid",
                "scenario": "Designing a dashboard navbar containing a logo on the left and 4 profile links on the right that collapse on tablets."
            }
        ],
        "Intermediate": [
            {
                "id": 1,
                "question": "What is the primary difference between SQL and NoSQL databases?",
                "options": [
                    "SQL databases are always faster than NoSQL.",
                    "SQL databases are relational and structured (table-based); NoSQL databases are non-relational (document, key-value, graph).",
                    "NoSQL databases do not support storing JSON data.",
                    "SQL databases cannot be run locally."
                ],
                "correct_option": "SQL databases are relational and structured (table-based); NoSQL databases are non-relational (document, key-value, graph)."
            },
            {
                "id": 2,
                "question": "What is the purpose of CORS (Cross-Origin Resource Sharing)?",
                "options": [
                    "To speed up CSS styling animations.",
                    "To secure databases from direct SQL injection.",
                    "To restrict browsers from loading resources from a different origin unless permitted by the server.",
                    "To compress bundle sizes in Vite."
                ],
                "correct_option": "To restrict browsers from loading resources from a different origin unless permitted by the server."
            },
            {
                "id": 3,
                "question": "Scenario: You want to build a real-time multiplayer notification bell in React. What protocol is most efficient?",
                "options": ["HTTP GET polling every 2 seconds", "SMTP mail routing", "WebSockets", "GraphQL queries"],
                "correct_option": "WebSockets",
                "scenario": "A collaborative board application needs to show green dots next to active team avatars instantly when they click objects."
            }
        ]
    }
}

class QuizAgent(BaseAgent):
    def generate_quiz(self, domain: str, difficulty: str, count: int, q_type: str) -> List[Dict[str, Any]]:
        """
        Generates a set of count quiz questions for the target domain and difficulty level.
        """
        system_instruction = (
            "You are an expert AI Examiner. Generate a quiz strictly in JSON format. "
            "The output should be a JSON array of objects, each having: "
            "'id' (integer), 'question' (string), 'options' (array of 4 strings), "
            "'correct_option' (the string that represents the correct option), and optionally 'scenario' (string if scenario-based). "
            "Output ONLY valid raw JSON."
        )
        
        prompt = (
            f"Generate a quiz with exactly {count} questions.\n"
            f"Domain: {domain}\n"
            f"Difficulty: {difficulty}\n"
            f"Question Type: {q_type}"
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
                    
        # Rule-based fallback database
        return self._get_fallback_quiz(domain, difficulty, count)

    def evaluate_quiz(self, questions: List[Dict[str, Any]], user_answers: List[str]) -> Dict[str, Any]:
        """
        Evaluates user answers, calculates accuracy, and generates helpful AI feedback.
        """
        evaluation = []
        correct_count = 0
        total = len(questions)
        
        for idx, q in enumerate(questions):
            correct_ans = q.get("correct_option", "")
            user_ans = user_answers[idx] if idx < len(user_answers) else ""
            
            is_correct = user_ans.strip().lower() == correct_ans.strip().lower()
            if is_correct:
                correct_count += 1
                
            evaluation.append({
                "id": q.get("id"),
                "question": q.get("question"),
                "user_answer": user_ans,
                "correct_answer": correct_ans,
                "is_correct": is_correct
            })
            
        accuracy = (correct_count / total) * 100 if total > 0 else 0
        
        # Feedback generation
        system_instruction = "You are an encouraging technical tutor. Write a short paragraph of feedback based on the quiz score."
        prompt = f"User scored {correct_count} out of {total} ({accuracy:.1f}%) on a technical quiz. Write a feedback paragraph."
        
        feedback_text = None
        if self.has_llm:
            feedback_text = self.run_prompt(prompt, system_instruction)
            
        if not feedback_text:
            if accuracy >= 80:
                feedback_text = f"Outstanding performance! You answered {correct_count}/{total} questions correctly. You demonstrate solid conceptual comprehension of this domain. Keep stretching yourself with advanced challenges!"
            elif accuracy >= 50:
                feedback_text = f"Good job! You scored {correct_count}/{total} ({accuracy:.1f}%). While you have a decent grasp of the basics, review the questions you missed to solidify your understanding of intermediate architectures."
            else:
                feedback_text = f"Keep practicing! You scored {correct_count}/{total}. Use this as a helpful guide to identifying areas that need review. Focus on the foundational concepts before trying higher difficulty modules."
                
        return {
            "score": correct_count,
            "total": total,
            "accuracy": accuracy,
            "feedback": feedback_text,
            "answers_evaluation": evaluation
        }

    def _get_fallback_quiz(self, domain: str, difficulty: str, count: int) -> List[Dict[str, Any]]:
        # Match domain tag
        dom_key = "ai/ml"
        for key in MOCK_QUESTION_BANK:
            if key in domain.lower() or domain.lower() in key:
                dom_key = key
                break
                
        diff = difficulty if difficulty in ["Beginner", "Intermediate"] else "Beginner"
        
        # Get matching questions
        questions = MOCK_QUESTION_BANK[dom_key][diff].copy()
        
        # Duplicate questions if count requested exceeds our database list size
        result = []
        while len(result) < count:
            for q in questions:
                # Append a copy with adjusted IDs
                q_copy = q.copy()
                q_copy["id"] = len(result) + 1
                result.append(q_copy)
                if len(result) == count:
                    break
        return result
