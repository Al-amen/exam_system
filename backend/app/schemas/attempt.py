from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime
import uuid

class AnswerBase(BaseModel):
    question_id: uuid.UUID
    answer: Optional[Any] = None

class AnswerCreate(AnswerBase):
    pass

class AnswerSchema(AnswerBase):
    id: uuid.UUID
    score: int
    is_correct: Optional[bool] = None
    
    class Config:
        from_attributes = True

class ExamAttemptCreate(BaseModel):
    exam_id: uuid.UUID

class ExamAttemptSchema(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    student_id: uuid.UUID
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    total_score: int
    
    class Config:
        from_attributes = True