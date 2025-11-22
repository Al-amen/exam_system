from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from app.schemas.question import Question

class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    is_published: bool = False

class ExamCreate(ExamBase):
    question_ids: List[uuid.UUID]

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    is_published: Optional[bool] = None
    question_ids: Optional[List[uuid.UUID]] = None

class Exam(ExamBase):
    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    question_count: Optional[int] = None
    
    class Config:
        from_attributes = True

class ExamWithQuestions(Exam):
    questions: List[Question] = []