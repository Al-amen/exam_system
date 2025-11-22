import uuid
import enum
from sqlalchemy import Column, String, Integer, JSON, DateTime, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class QuestionType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    TEXT = "text"
    IMAGE_UPLOAD = "image_upload"

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    complexity = Column(String, nullable=False)
    type = Column(SQLEnum(QuestionType), nullable=False)
    options = Column(JSON)
    correct_answers = Column(JSON)
    max_score = Column(Integer, default=1)
    tags = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=False)