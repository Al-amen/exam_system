import pandas as pd

# Sample data for the template
sample_data = [
    {
        'title': 'What is 2+2?',
        'description': 'Basic arithmetic question',
        'complexity': 'Class 1',
        'type': 'single_choice',
        'options': '["4", "5", "6", "7"]',
        'correct_answers': '["4"]',
        'max_score': 1,
        'tags': 'math,arithmetic,basic'
    },
    {
        'title': 'Capital of France',
        'description': 'Geography question',
        'complexity': 'Class 2',
        'type': 'single_choice',
        'options': '["London", "Berlin", "Paris", "Madrid"]',
        'correct_answers': '["Paris"]',
        'max_score': 1,
        'tags': 'geography,europe'
    },
    {
        'title': 'Select prime numbers',
        'description': 'Math question',
        'complexity': 'Class 3',
        'type': 'multi_choice',
        'options': '["2", "4", "7", "9", "11"]',
        'correct_answers': '["2", "7", "11"]',
        'max_score': 2,
        'tags': 'math,prime numbers'
    },
    {
        'title': 'Explain photosynthesis',
        'description': 'Biology question',
        'complexity': 'Class 4',
        'type': 'text',
        'options': '',
        'correct_answers': '',
        'max_score': 5,
        'tags': 'biology,plants'
    },
    {
        'title': 'Upload circuit diagram',
        'description': 'Physics question',
        'complexity': 'Class 5',
        'type': 'image_upload',
        'options': '',
        'correct_answers': '',
        'max_score': 3,
        'tags': 'physics,electronics'
    }
]

# Create DataFrame
df = pd.DataFrame(sample_data)

# Create Excel file with formatting
with pd.ExcelWriter('question_import_template.xlsx', engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='Questions', index=False)
    
    # Get the workbook and worksheet
    workbook = writer.book
    worksheet = writer.sheets['Questions']
    
   
