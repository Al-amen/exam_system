import pandas as pd
import json
from typing import List, Dict, Any
from app.models.question import QuestionType

class ExcelParser:
    def __init__(self):
        self.required_columns = ['title', 'complexity', 'type']
        
    def parse_excel(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse Excel file and return list of question dictionaries"""
        try:
            df = pd.read_excel(file_path)
            
            # Validate required columns
            missing_columns = [col for col in self.required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            questions = []
            for index, row in df.iterrows():
                question = self._parse_row(row)
                if question:
                    questions.append(question)
                    
            return questions
            
        except Exception as e:
            raise ValueError(f"Error parsing Excel file: {str(e)}")
    
    def _parse_row(self, row) -> Dict[str, Any]:
        """Parse a single row from Excel"""
        try:
            question = {
                'title': str(row['title']),
                'description': str(row.get('description', '')),
                'complexity': str(row['complexity']),
                'type': QuestionType(row['type']),
                'max_score': int(row.get('max_score', 1)),
                'tags': self._parse_tags(row.get('tags', ''))
            }
            
            # Parse options for choice questions
            if question['type'] in [QuestionType.SINGLE_CHOICE, QuestionType.MULTI_CHOICE]:
                question['options'] = self._parse_json_field(row.get('options', '[]'))
                question['correct_answers'] = self._parse_json_field(row.get('correct_answers', '[]'))
            else:
                question['options'] = None
                question['correct_answers'] = None
                
            return question
            
        except Exception as e:
            raise ValueError(f"Error parsing row: {str(e)}")
    
    def _parse_json_field(self, value: str) -> Any:
        """Parse JSON field from string"""
        if pd.isna(value) or value == '':
            return []
        try:
            return json.loads(str(value))
        except json.JSONDecodeError:
            return str(value).split(',') if ',' in str(value) else [str(value)]
    
    def _parse_tags(self, tags: str) -> List[str]:
        """Parse tags from CSV string"""
        if pd.isna(tags) or tags == '':
            return []
        return [tag.strip() for tag in str(tags).split(',')]