from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from app.models.exam import Exam, ExamQuestion
from app.models.question import Question
from app.schemas.exam import ExamCreate, ExamUpdate

def create_exam(db: Session, exam: ExamCreate, created_by: uuid.UUID):
    # Create the exam
    db_exam = Exam(
        title=exam.title,
        description=exam.description,
        start_time=exam.start_time,
        end_time=exam.end_time,
        duration_minutes=exam.duration_minutes,
        is_published=exam.is_published,
        created_by=created_by
    )
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    # Add questions to exam
    for order, question_id in enumerate(exam.question_ids):
        # Verify question exists
        question = db.query(Question).filter(Question.id == question_id).first()
        if question:
            exam_question = ExamQuestion(
                exam_id=db_exam.id,
                question_id=question_id,
                order=order
            )
            db.add(exam_question)
    
    db.commit()
    db.refresh(db_exam)
    return db_exam

def get_exams(db: Session, skip: int = 0, limit: int = 100):
    exams = db.query(Exam).order_by(Exam.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add question count to each exam
    for exam in exams:
        exam.question_count = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).count()
    
    return exams

def get_exam_with_questions(db: Session, exam_id: str):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        return None
    
    # Get the actual Question objects, not ExamQuestion objects
    questions = db.query(Question).join(
        ExamQuestion, Question.id == ExamQuestion.question_id
    ).filter(
        ExamQuestion.exam_id == exam_id
    ).order_by(ExamQuestion.order).all()
    
    # Convert exam to dict and add questions
    exam_dict = {
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "start_time": exam.start_time,
        "end_time": exam.end_time,
        "duration_minutes": exam.duration_minutes,
        "is_published": exam.is_published,
        "created_by": exam.created_by,
        "created_at": exam.created_at,
        "questions": questions,
        "question_count": len(questions)
    }
    
    return exam_dict

def update_exam(db: Session, exam_id: str, exam_update: ExamUpdate):
    db_exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not db_exam:
        return None
    
    # Update basic fields
    update_data = exam_update.dict(exclude_unset=True, exclude={'question_ids'})
    for field, value in update_data.items():
        setattr(db_exam, field, value)
    
    # Update questions if provided
    if exam_update.question_ids is not None:
        # Remove existing exam questions
        db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).delete()
        
        # Add new questions
        for order, question_id in enumerate(exam_update.question_ids):
            question = db.query(Question).filter(Question.id == question_id).first()
            if question:
                exam_question = ExamQuestion(
                    exam_id=exam_id,
                    question_id=question_id,
                    order=order
                )
                db.add(exam_question)
    
    db.commit()
    db.refresh(db_exam)
    
    # Return exam with questions
    return get_exam_with_questions(db, exam_id)

def delete_exam(db: Session, exam_id: str):
    db_exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if db_exam:
        # Delete associated exam questions first
        db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).delete()
        db.delete(db_exam)
        db.commit()
    return True