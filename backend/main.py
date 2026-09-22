from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException, Depends
from backend.auth import SessionLocal, hash_password, verify_password
from backend.models import Base, User, Assessment
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.rag.knowledge_base import search_knowledge


app = FastAPI(title="TerraMind AI")


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Conversation Memory
# -----------------------------

conversation_history = []


# -----------------------------
# Environmental Data Model
# -----------------------------

class EnvironmentalData(BaseModel):
    soil_organic_carbon: float
    soil_ph: float
    rainfall: str
    temperature: float
    crop: str
    land_use: str


# -----------------------------
# Chat Request
# -----------------------------

class ChatRequest(BaseModel):
    question: str


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "TerraMind AI Biodiversity Intelligence is running!"
    }


# -----------------------------
# Environmental Analysis
# -----------------------------

@app.post("/analyze")
def analyze_environment(data: EnvironmentalData):

    risks = []

    if data.soil_organic_carbon < 1.0:
        risks.append("Low soil organic carbon")

    if data.rainfall.lower() == "low":
        risks.append("Low rainfall")

    if data.land_use.lower() == "monoculture":
        risks.append("Low crop diversity")

    if data.temperature > 30:
        risks.append("High temperature")

    # Build RAG query
    query = (
        f"Soil organic carbon {data.soil_organic_carbon}, "
        f"soil pH {data.soil_ph}, "
        f"rainfall {data.rainfall}, "
        f"temperature {data.temperature}, "
        f"crop {data.crop}, "
        f"land use {data.land_use}. "
        f"Explain environmental risks, soil health, climate effects, "
        f"land-use effects, and biodiversity impacts."
    )

    results = search_knowledge(query, top_k=3)

    retrieved_knowledge = []

    for document in results["documents"][0]:
        retrieved_knowledge.append({
            "evidence": document[:1000]
        })

    recommendations = []
    

    # Multi-metric reasoning
    if (
        data.soil_organic_carbon < 1.0
        and data.rainfall.lower() == "low"
        and data.land_use.lower() == "monoculture"
    ):

        recommendations.append({
            "action": (
                "Introduce agroforestry or diversified intercropping "
                "with suitable native vegetation."
            ),

            "why": (
                "The combination of low soil organic carbon, low rainfall, "
                "and monoculture indicates multiple environmental pressures. "
                "Increasing vegetation diversity and organic inputs can "
                "support soil functions, water-related functions, and "
                "habitat availability."
            ),

            "impacted_metrics": [
                "Soil organic carbon",
                "Soil moisture",
                "Crop diversity",
                "Habitat diversity",
                "Biodiversity"
            ],

            "time_horizon": "Medium to long term",

            "confidence": "High",

            "scientific_basis": (
                "Agroforestry research reports improvements in soil-related "
                "ecosystem functions compared with crop monocultures."
            ),

            "source": (
                "Muchane et al. (2020), Agroforestry boosts soil health "
                "in the humid and sub-humid tropics: A meta-analysis; "
                "FAO Agroecology Knowledge Hub"
            )
        })

    elif data.soil_organic_carbon < 1.0:

        recommendations.append({
            "action": (
                "Increase organic matter inputs and maintain vegetation cover."
            ),

            "why": (
                "Organic inputs and vegetation cover can support soil structure, "
                "water-related soil functions, and biological activity."
            ),

            "impacted_metrics": [
                "Soil organic carbon",
                "Soil moisture",
                "Soil biological activity"
            ],

            "time_horizon": "Medium term",

            "confidence": "Medium",

            "scientific_basis": (
                "Increasing organic inputs and maintaining vegetation cover "
                "can support soil structure and biological activity."
            ),

            "source": "TerraMind AI soil-health knowledge base"
        })

    elif data.land_use.lower() == "monoculture":

        recommendations.append({
            "action": "Increase crop and vegetation diversity.",

            "why": (
                "Greater vegetation diversity can provide a wider range "
                "of food and habitat resources for organisms."
            ),

            "impacted_metrics": [
                "Crop diversity",
                "Habitat diversity",
                "Biodiversity"
            ],

            "time_horizon": "Medium term",

            "confidence": "Medium",

            "scientific_basis": (
                "Greater vegetation diversity can increase the variety "
                "of resources and habitat conditions available to organisms."
            ),

            "source": "TerraMind AI biodiversity knowledge base"
        })

    return {
        "message": "Environmental assessment completed",
        "identified_risks": risks,
        "input_data": data,
        "retrieved_knowledge": retrieved_knowledge,
        "recommendations": recommendations
    }

why_it_works = (
    ...
)

impacted_metrics = (
    ...
)

time_horizon = "Medium to long term"

confidence = "High"

scientific_basis = (
    ...
)



# ============================================================
# TERRAMIND AI GENERAL PROJECT CHATBOT
# ============================================================

@app.post("/chat")
def chat(request: ChatRequest):

    global conversation_history

    user_question = request.question.strip()

    # -----------------------------
    # Store user question
    # -----------------------------

    conversation_history.append({
        "role": "user",
        "message": user_question
    })

    conversation_history = conversation_history[-6:]

    # -----------------------------
    # Build conversation context
    # -----------------------------

    previous_context = ""

    for message in conversation_history[:-1]:
        previous_context += (
            f"{message['role']}: {message['message']}\n"
        )

    # -----------------------------
    # Combine previous context
    # with current question
    # -----------------------------

    rag_query = (
        f"Previous conversation:\n"
        f"{previous_context}\n"
        f"Current question:\n"
        f"{user_question}\n\n"
        f"Find environmental knowledge relevant to this question. "
        f"Consider soil health, soil organic carbon, soil pH, soil moisture, "
        f"rainfall, temperature, water availability, biodiversity, "
        f"species richness, habitat diversity, land use, crop diversity, "
        f"habitat fragmentation, connectivity, deforestation, pollution, "
        f"and human environmental impacts."
    )

    # -----------------------------
    # Retrieve relevant knowledge
    # -----------------------------

    results = search_knowledge(
    user_question,
    top_k=4
)
    documents = results["documents"][0]

    # -----------------------------
    # Prepare knowledge
    # -----------------------------

    knowledge = "\n\n".join(documents)

    # -----------------------------
    # Detect environmental topics
    # -----------------------------

    question = user_question.lower()

    topics = []

    topic_keywords = {
        "soil health": [
            "soil",
            "soil health",
            "soil quality",
            "organic matter"
        ],

        "soil organic carbon": [
            "soc",
            "soil carbon",
            "organic carbon"
        ],

        "soil pH": [
            "ph",
            "acidic soil",
            "alkaline soil"
        ],

        "rainfall": [
            "rainfall",
            "rain",
            "precipitation"
        ],

        "temperature": [
            "temperature",
            "heat",
            "hot"
        ],

        "water availability": [
            "water",
            "water availability",
            "water stress",
            "moisture"
        ],

        "biodiversity": [
            "biodiversity",
            "species",
            "wildlife",
            "organisms"
        ],

        "habitat": [
            "habitat",
            "habitats",
            "fragmentation",
            "connectivity"
        ],

        "land use": [
            "land use",
            "land cover",
            "monoculture",
            "agroforestry",
            "cropping"
        ],

        "human impact": [
            "pollution",
            "deforestation",
            "human impact",
            "degradation"
        ]
    }

    for topic, keywords in topic_keywords.items():

        if any(keyword in question for keyword in keywords):
            topics.append(topic)

    # -----------------------------
    # Detect follow-up context
    # -----------------------------

    follow_up_words = [
        "also",
        "then",
        "what about",
        "what happens",
        "how does it",
        "what should i do",
        "and if",
        "if it",
        "why"
    ]

    is_follow_up = any(
        word in question
        for word in follow_up_words
    )

    # -----------------------------
    # Extract previous user
    # environmental statements
    # -----------------------------

    previous_user_messages = []

    for message in conversation_history[:-1]:

        if message["role"] == "user":
            previous_user_messages.append(
                message["message"]
            )

    previous_user_context = " ".join(
        previous_user_messages
    )

    # -----------------------------
    # Build dynamic answer
    # -----------------------------

    answer_parts = []

    # Opening
    if is_follow_up and previous_user_context:

        answer_parts.append(
            "Considering your previous environmental information, "
            "this question should be evaluated together with the "
            "conditions you provided earlier."
        )

    else:

        answer_parts.append(
            "Based on the TerraMind AI environmental knowledge base, "
            "this question can be evaluated using the relevant "
            "environmental factors and their interactions."
        )

    # Topics
    if topics:

        answer_parts.append(
            "Relevant factors: "
            + ", ".join(topics)
            + "."
        )

    # Knowledge-based explanation
    if knowledge:

        answer_parts.append(
            "Environmental reasoning:\n"
            + knowledge[:7000]
        )

    # Multi-metric reasoning
    if len(topics) >= 2:

        answer_parts.append(
            "Multi-metric reasoning: These environmental factors "
            "should not be considered independently. Changes in one "
            "factor can influence related soil, water, habitat, "
            "vegetation, and biodiversity conditions."
        )

    # Recommendation
    recommendation_words = [
        "what should",
        "what can i do",
        "how can i improve",
        "recommend",
        "recommendation",
        "solution",
        "management",
        "improve"
    ]

    if any(word in question for word in recommendation_words):

        answer_parts.append(
            "Possible management direction: consider practices "
            "that maintain vegetation cover, improve soil organic "
            "matter, support water-related soil functions, increase "
            "vegetation diversity, and protect or reconnect habitat "
            "where appropriate. The most suitable action depends "
            "on local ecosystem and land-use conditions."
        )

    # Evidence
    answer_parts.append(
        "Evidence: The response is grounded in the retrieved "
        "TerraMind AI knowledge base and its scientific sources. "
        "Environmental outcomes can vary by location, ecosystem, "
        "species, climate, soil, and management."
    )

    answer = "\n\n".join(answer_parts)

    # -----------------------------
    # Store AI response
    # -----------------------------

    conversation_history.append({
        "role": "assistant",
        "message": answer
    })

    conversation_history = conversation_history[-6:]

    # -----------------------------
    # Return
    # -----------------------------

    return {
        "question": user_question,
        "answer": answer,
        "topics_detected": topics,
        "retrieved_sources": len(documents),
        "conversation_length": len(conversation_history)
    }
# ===============================
# AUTHENTICATION
# ===============================

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_username = db.query(User).filter(
        User.username == request.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = User(
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user_id": new_user.id,
        "username": new_user.username
    }


@app.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }
# ===============================
# SAVED ASSESSMENTS
# ===============================

class AssessmentRequest(BaseModel):
    user_id: int
    soil_organic_carbon: str
    soil_ph: str
    rainfall: str
    temperature: str
    crop: str
    land_use: str
    recommendation: str
    impacted_metrics: str
    risks: str


@app.get("/assessments/{user_id}")
def get_assessments(
    user_id: int,
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(
        Assessment.user_id == user_id
    ).order_by(
        Assessment.id.desc()
    ).all()

    return [
        {
            "id": assessment.id,
            "soil_organic_carbon": assessment.soil_organic_carbon,
            "soil_ph": assessment.soil_ph,
            "rainfall": assessment.rainfall,
            "temperature": assessment.temperature,
            "crop": assessment.crop,
            "land_use": assessment.land_use,
            "recommendation": assessment.recommendation,
            "impacted_metrics": assessment.impacted_metrics,
            "risks": assessment.risks
        }
        for assessment in assessments
    ]
    