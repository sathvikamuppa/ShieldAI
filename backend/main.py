from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "ShieldAI Backend Running"}


@app.post("/scan")
def scan_data(request: ScanRequest):

    text = request.text

    # Patterns
    email_pattern = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
    phone_pattern = r'\b\d{10}\b'
    aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
    pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'

    # Password formats:
    # Password: admin123
    # password=welcome123
    # PASSWORD : Test@123
    password_pattern = r'(?i)password\s*[:=]\s*\S+'

    # Detect
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    aadhaars = re.findall(aadhaar_pattern, text)
    pans = re.findall(pan_pattern, text)
    passwords = re.findall(password_pattern, text)

    # Risk score
    risk_score = (
        len(emails) * 20 +
        len(phones) * 20 +
        len(aadhaars) * 30 +
        len(pans) * 30 +
        len(passwords) * 50
    )

    if risk_score >= 100:
        risk_level = "HIGH"
    elif risk_score >= 50:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Sanitization
    sanitized_text = text

    sanitized_text = re.sub(
        email_pattern,
        "[EMAIL]",
        sanitized_text
    )

    sanitized_text = re.sub(
        phone_pattern,
        "[PHONE]",
        sanitized_text
    )

    sanitized_text = re.sub(
        aadhaar_pattern,
        "[AADHAAR]",
        sanitized_text
    )

    sanitized_text = re.sub(
        pan_pattern,
        "[PAN]",
        sanitized_text
    )

    sanitized_text = re.sub(
        r'(?i)(password\s*[:=]\s*)(\S+)',
        r'\1[PASSWORD]',
        sanitized_text
    )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "emails_found": emails,
        "phones_found": phones,
        "aadhaars_found": aadhaars,
        "pans_found": pans,
        "passwords_found": passwords,
        "sanitized_text": sanitized_text
    }