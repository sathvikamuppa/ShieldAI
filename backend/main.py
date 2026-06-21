from fastapi import FastAPI
import re

app = FastAPI()

@app.get("/")
def home():
    return {"message": "ShieldAI Running"}

@app.post("/scan")
def scan(data: dict):

    text = data["text"]

    phones = re.findall(r"\d{10}", text)

    emails = re.findall(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    risk_score = len(phones) * 20 + len(emails) * 20

    sanitized_text = text

    for phone in phones:
        sanitized_text = sanitized_text.replace(phone, "[PHONE]")

    for email in emails:
        sanitized_text = sanitized_text.replace(email, "[EMAIL]")

    return {
        "risk_score": risk_score,
        "phones_found": phones,
        "emails_found": emails,
        "sanitized_text": sanitized_text
    }