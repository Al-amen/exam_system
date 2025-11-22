import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)  # Exam duration in minutes
    is_published = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    questions = relationship("ExamQuestion", back_populates="exam")
    attempts = relationship("ExamAttempt", back_populates="exam")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    order = Column(Integer, nullable=False)  # Order of question in exam
    
    # Relationships
    exam = relationship("Exam", back_populates="questions")
    question = relationship("Question")