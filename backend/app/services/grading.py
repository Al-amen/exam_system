from typing import Any, List
from app.models.question import QuestionType

class GradingService:
    @staticmethod
    def grade_question(question_type: QuestionType, student_answer: Any, correct_answers: List[Any]) -> int:
        """Grade a single question and return score"""
        if not student_answer:
            return 0
            
        if question_type == QuestionType.SINGLE_CHOICE:
            return 1 if student_answer in correct_answers else 0
        elif question_type == QuestionType.MULTI_CHOICE:
            if not isinstance(student_answer, list):
                return 0
            student_set = set(student_answer)
            correct_set = set(correct_answers)
            return 1 if student_set == correct_set else 0
        else:
            # Text and image questions need manual grading
            return 0
    
    @staticmethod
    def calculate_total_score(graded_answers: List[dict]) -> int:
        """Calculate total score from graded answers"""
        return sum(answer.get('score', 0) for answer in graded_answers)