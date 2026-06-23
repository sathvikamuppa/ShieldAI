from fastapi import UploadFile, File
import PyPDF2
from docx import Document
from io import BytesIO
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import re


app = FastAPI()
# HuggingFace NER Model

ner = pipeline(
    "ner",
    model="Jean-Baptiste/roberta-large-ner-english",
    aggregation_strategy="simple"
)
# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "ShieldAI Running"}

def detect_intent(text):

    text_lower = text.lower()

    if any(word in text_lower for word in [
        "bug", "source code", "code review",
        "debug", "repository", "github"
    ]):
        return "CODE_REVIEW"

    if any(word in text_lower for word in [
        "customer", "client", "user database"
    ]):
        return "CUSTOMER_DATA"

    if any(word in text_lower for word in [
        "revenue", "finance", "profit",
        "quarterly report"
    ]):
        return "FINANCIAL_ANALYSIS"

    if any(word in text_lower for word in [
        "security", "vulnerability",
        "penetration testing"
    ]):
        return "SECURITY_ANALYSIS"

    return "GENERAL_QUERY"

def extract_entities(text):
    
    entities = ner(text)

def extract_entities(text):

    entities = ner(text)

    for entity in entities:
        if entity["entity_group"] == "ORG":
            print("ORG FOUND:", entity["word"])

    persons = set()
    organizations = set()
    locations = set()

    for entity in entities:

        word = entity["word"].strip().title()

        if len(word) < 3:
            continue

        if entity["entity_group"] == "PER":

            if " " in word:
                persons.add(word)

        elif entity["entity_group"] == "ORG":

            organizations.add(word)

        elif entity["entity_group"] == "LOC":

            locations.add(word)

    return {
        "persons": list(persons),
        "organizations": list(organizations)[:1],
        "locations": list(locations)
    }
def rehydrate_response(llm_response, placeholder_map):

    restored = llm_response

    for token, value in placeholder_map.items():
        restored = restored.replace(
            token,
            value
        )

    return restored
@app.post("/rehydrate")
def rehydrate(data: dict):

    response_text = data.get(
        "response_text",
        ""
    )

    placeholder_map = data.get(
        "placeholder_map",
        {}
    )

    restored = rehydrate_response(
        response_text,
        placeholder_map
    )

    return {
        "rehydrated_response": restored
    }
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    text = ""

    if file.filename.endswith(".txt"):

        contents = await file.read()

        text = contents.decode("utf-8")

    elif file.filename.endswith(".pdf"):

        contents = await file.read()

        pdf_reader = PyPDF2.PdfReader(
            BytesIO(contents)
        )

        for page in pdf_reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    elif file.filename.endswith(".docx"):

        contents = await file.read()

        doc = Document(
            BytesIO(contents)
        )

        for para in doc.paragraphs:

            text += para.text + "\n"

    else:

        return {
            "error":
            "Unsupported file format"
        }

    return {
        "text": text
    }
@app.post("/scan")
def scan(data: dict):

    text = data.get("text", "")
    entity_data = extract_entities(text)
    placeholder_map = {}
    print(entity_data)
    reasons = []
    risk_score = 0

    emails = re.findall(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    phones = re.findall(
        r"\b\d{10}\b",
        text
    )

    credit_cards = re.findall(
        r"\b(?:\d[ -]*?){13,16}\b",
        text
    )

    ips = re.findall(
        r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
        text
    )


    passwords = re.findall(
        r'(?i)(password\s*[:=]\s*[^\s]+)',
        text
    )


    github_tokens = re.findall(
        r'gh[pousr]_[A-Za-z0-9]{20,}',
        text
    )


    aws_keys = re.findall(
        r'AKIA[0-9A-Z]{16}',
        text
    )


    api_keys = re.findall(
        r'(?i)(api[_-]?key\s*[:=]\s*[A-Za-z0-9\-_]{8,})',
        text
    )

    aadhaars = re.findall(
        r"\b\d{4}\s?\d{4}\s?\d{4}\b",
        text
    )

    pans = re.findall(
        r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
        text
    )

    source_code_patterns = [
        r"def\s+\w+\(",
        r"function\s+\w+\(",
        r"class\s+\w+",
        r"public static void main",
        r"#include\s*<",
        r"import\s+\w+",
    ]

    source_code_found = False

    for pattern in source_code_patterns:
        if re.search(pattern, text):
            source_code_found = True
            break


    if emails:
        risk_score += len(emails) * 10
        reasons.append("Email Address Detected")

    if phones:
        risk_score += len(phones) * 15
        reasons.append("Phone Number Detected")

    if credit_cards:
        risk_score += len(credit_cards) * 40
        reasons.append("Credit Card Detected")

    if passwords:
        risk_score += len(passwords) * 50
        reasons.append("Password Detected")

    if github_tokens:
        risk_score += len(github_tokens) * 60
        reasons.append("GitHub Token Detected")

    if aws_keys:
        risk_score += len(aws_keys) * 70
        reasons.append("AWS Credential Detected")

    if api_keys:
        risk_score += len(api_keys) * 60
        reasons.append("API Key Detected")
    
    if aadhaars:
        risk_score += len(aadhaars) * 30
        reasons.append("Aadhaar Detected")

    if pans:
        risk_score += len(pans) * 25
        reasons.append("PAN Detected")

    if ips:
        risk_score += len(ips) * 20
        reasons.append("IP Address Detected")

    if source_code_found:
        risk_score += 50
        reasons.append("Source Code Detected")

    # NER Risk Scoring
    if entity_data["persons"]:
        risk_score += len(entity_data["persons"]) * 10
        reasons.append("Person Name Detected")

    if entity_data["organizations"]:
        risk_score += len(entity_data["organizations"]) * 5
        reasons.append("Organization Detected")

    if entity_data["locations"]:
        risk_score += len(entity_data["locations"]) * 5
        reasons.append("Location Detected")

    risk_score = min(risk_score, 100)

    if risk_score <= 30:
        risk_level = "LOW"
        action = "ALLOW"

    elif risk_score <= 70:
        risk_level = "MEDIUM"
        action = "SANITIZE"

    else:
        risk_level = "HIGH"
        action = "BLOCK"

    intent = detect_intent(text)

    sanitized_text = text

    for i, email in enumerate(emails, start=1):

        token = f"[EMAIL_{i}]"

        placeholder_map[token] = email

        sanitized_text = sanitized_text.replace(
            email,
            token
        )

    for phone in phones:
        sanitized_text = sanitized_text.replace(
            phone,
            "[PHONE]"
        )

    for card in credit_cards:
        sanitized_text = sanitized_text.replace(
            card,
            "[CREDIT_CARD]"
        )

    for pwd in passwords:
        sanitized_text = sanitized_text.replace(
            pwd,
            "[PASSWORD]"
        )

    for key in github_tokens:
        sanitized_text = sanitized_text.replace(
            key,
            "[GITHUB_TOKEN]"
        )

    for key in aws_keys:
        sanitized_text = sanitized_text.replace(
            key,
            "[AWS_KEY]"
        )

    for key in api_keys:
        sanitized_text = sanitized_text.replace(
            key,
            "[API_KEY]"
        )

    for aadhaar in aadhaars:
        sanitized_text = sanitized_text.replace(
            aadhaar,
            "[AADHAAR]"
        )

    for pan in pans:
        sanitized_text = sanitized_text.replace(
            pan,
            "[PAN]"
        )
    # Entity Sanitization

    for i, person in enumerate(
        sorted(
            entity_data["persons"],
            key=len,
            reverse=True
        ),
        start=1
    ):

        token = f"[PERSON_{i}]"

        placeholder_map[token] = person

        sanitized_text = sanitized_text.replace(
            person,
            token
    )

    for i, org in enumerate(
        sorted(
            entity_data["organizations"],
            key=len,
            reverse=True
        ),
        start=1
    ):

        token = f"[ORG_{i}]"

        placeholder_map[token] = org

        sanitized_text = sanitized_text.replace(
            org,
            token
        )
    for i, location in enumerate(
        sorted(
            entity_data["locations"],
            key=len,
            reverse=True
        ),
        start=1
    ):

        token = f"[LOCATION_{i}]"

        placeholder_map[token] = location

        sanitized_text = sanitized_text.replace(
            location,
            token
        )
    print(placeholder_map)
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "action": action,
        "intent": intent,
        "reasons": reasons,

        "persons_found": entity_data["persons"],
        "organizations_found": entity_data["organizations"],
        "locations_found": entity_data["locations"],

        "aadhaars_found": aadhaars,
        "pans_found": pans,        

        "emails_found": emails,
        "phones_found": phones,
        "credit_cards_found": credit_cards,
        "passwords_found": passwords,
        "github_tokens_found": github_tokens,
        "aws_keys_found": aws_keys,
        "api_keys_found": api_keys,
        "ips_found": ips,

        "source_code_found": source_code_found,

        "sanitized_text": sanitized_text,

        "placeholder_map": placeholder_map
    }