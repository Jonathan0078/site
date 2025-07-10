# Funções utilitárias para extração de texto de arquivos e OCR
# (Opcional: para organizar caso queira crescer o projeto)

import os
from PIL import Image
try:
    import pdfplumber
except ImportError:
    pdfplumber = None
try:
    import pytesseract
except ImportError:
    pytesseract = None

def extract_text_pdfplumber(file_path):
    if not pdfplumber:
        return ''
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ''
    return text

def extract_text_image(image_path, lang='por'):
    if not pytesseract:
        return ''
    img = Image.open(image_path)
    return pytesseract.image_to_string(img, lang=lang)
