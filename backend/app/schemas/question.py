
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Any
from app.models.question import QuestionType
import uuid

class QuestionBase(BaseModel):
    title: str
    description: Optional[str] = None
    complexity: str
    type: QuestionType
    options: Optional[List[str]] = None
    correct_answers: Optional[List[Any]] = None
    max_score: int = 1
    tags: Optional[List[str]] = None

class QuestionCreate(QuestionBase):
    # Remove created_by from here - it will be set by the backend
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    complexity: Optional[str] = None
    type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answers: Optional[List[Any]] = None
    max_score: Optional[int] = None
    tags: Optional[List[str]] = None

class Question(QuestionBase):
    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionImport(BaseModel):
    file_path: str