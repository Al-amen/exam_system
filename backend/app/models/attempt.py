import uuid
import enum
from sqlalchemy import Column, String, DateTime, Integer, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    status = Column(String, default=AttemptStatus.IN_PROGRESS)
    total_score = Column(Integer, default=0)
    auto_saved_answers = Column(JSON)  # For auto-save functionality
    
    # Relationships
    exam = relationship("Exam", back_populates="attempts")
    answers = relationship("Answer", back_populates="attempt")

class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("exam_attempts.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    answer = Column(JSON)  # Can be string, array, or file path
    score = Column(Integer, default=0)
    is_correct = Column(Boolean)
    graded_at = Column(DateTime)
    
    # Relationships
    attempt = relationship("ExamAttempt", back_populates="answers")
    question = relationship("Question")