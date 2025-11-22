import os
import tempfile
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.question import Question, QuestionCreate, QuestionUpdate
from app.schemas.user import User
from app.crud.question import get_questions, create_question, get_question, update_question, delete_question
from app.services.excel_parser import ExcelParser

router = APIRouter()

@router.get("/", response_model=List[Question])
def read_questions(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    type: Optional[str] = None,
    complexity: Optional[str] = None,
    tags: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions = get_questions(
        db, 
        skip=skip, 
        limit=limit, 
        search=search,
        type=type,
        complexity=complexity,
        tags=tags
    )
    return questions

@router.post("/", response_model=Question)
def create_new_question(
    question: QuestionCreate,  # Now this doesn't expect created_by
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create the question with the current user's ID
    return create_question(db, question, current_user.id)

@router.get("/{question_id}", response_model=Question)
def read_question(
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        uuid.UUID(question_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid question ID format")
    
    question = get_question(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.put("/{question_id}", response_model=Question)
def update_existing_question(
    question_id: str,
    question_update: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        uuid.UUID(question_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid question ID format")
    
    # Check if question exists
    existing_question = get_question(db, question_id)
    if not existing_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update the question
    updated_question = update_question(db, question_id, question_update)
    return updated_question

@router.delete("/{question_id}")
def delete_existing_question(
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        uuid.UUID(question_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid question ID format")
    
    # Check if question exists
    existing_question = get_question(db, question_id)
    if not existing_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Delete the question
    delete_question(db, question_id)
    return {"message": "Question deleted successfully"}

@router.post("/import")
async def import_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only Excel files are allowed")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        parser = ExcelParser()
        questions_data = parser.parse_excel(temp_file_path)
        
        created_questions = []
        for q_data in questions_data:
            question_create = QuestionCreate(
                **q_data,
                created_by=current_user.id
            )
            question = create_question(db, question_create)
            created_questions.append(question)
        
        return {"message": f"Successfully imported {len(created_questions)} questions"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error importing questions: {str(e)}")
    finally:
        os.unlink(temp_file_path)