from sqlalchemy import String, text
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate

def get_questions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    type: Optional[str] = None,
    complexity: Optional[str] = None,
    tags: Optional[str] = None
):
    # Get all questions first
    all_questions = db.query(Question).offset(skip).limit(limit).all()
    
    # Apply filters in Python (less efficient but guaranteed to work)
    filtered_questions = all_questions
    
    if search:
        search_lower = search.lower()
        filtered_questions = [
            q for q in filtered_questions 
            if search_lower in q.title.lower() or 
               (q.description and search_lower in q.description.lower())
        ]
    
    if type:
        filtered_questions = [q for q in filtered_questions if q.type == type]
    
    if complexity:
        filtered_questions = [q for q in filtered_questions if q.complexity == complexity]
    
    if tags:
        filtered_questions = [
            q for q in filtered_questions 
            if q.tags and tags in q.tags
        ]
    
    return filtered_questions




def create_question(db: Session, question: QuestionCreate, created_by: uuid.UUID):
    # Convert to dict and add created_by
    question_data = question.dict()
    question_data['created_by'] = created_by
    
    db_question = Question(**question_data)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_question(db: Session, question_id: str):
    try:
        return db.query(Question).filter(Question.id == question_id).first()
    except Exception as e:
        print(f"Error getting question: {e}")
        return None

def update_question(db: Session, question_id: str, question_update: QuestionUpdate):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        return None
    
    # Update only the fields that are provided
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: str):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if db_question:
        db.delete(db_question)
        db.commit()
    return True