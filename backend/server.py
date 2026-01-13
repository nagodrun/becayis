from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import hashlib
import secrets
from collections import defaultdict
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
security = HTTPBearer()

# Rate limiting storage (in-memory for MVP)
rate_limit_store = defaultdict(list)
INVITATION_LIMIT_PER_DAY = 10

# Create the main app
app = FastAPI(title="Becayiş API")
api_router = APIRouter(prefix="/api")

# ============= UTILS =============
def hash_sensitive_data(data: str) -> str:
    """Hash TC ID and registry numbers"""
    return hashlib.sha256(data.encode()).hexdigest()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token geçersiz")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token geçersiz")

def generate_otp() -> str:
    return f"{secrets.randbelow(1000000):06d}"

async def create_notification(user_id: str, title: str, message: str, notification_type: str):
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)

# ============= MODELS =============
class RegisterStep1(BaseModel):
    email: EmailStr
    password: str

class RegisterStep2(BaseModel):
    verification_id: str
    phone: str

class VerifyOTP(BaseModel):
    verification_id: str
    otp: str

class CompleteProfile(BaseModel):
    user_id: str
    display_name: str
    institution: str
    role: str
    current_province: str
    current_district: str
    bio: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str

class CreateListing(BaseModel):
    title: str
    institution: str
    role: str
    current_province: str
    current_district: str
    desired_province: str
    desired_district: str
    notes: Optional[str] = None

class UpdateListing(BaseModel):
    title: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[str] = None
    current_province: Optional[str] = None
    current_district: Optional[str] = None
    desired_province: Optional[str] = None
    desired_district: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class SendInvitation(BaseModel):
    listing_id: str

class RespondInvitation(BaseModel):
    invitation_id: str
    action: str  # "accept" or "reject"

class SendMessage(BaseModel):
    conversation_id: str
    content: str

class BlockUser(BaseModel):
    blocked_user_id: str
    reason: Optional[str] = None

class UpdateProfile(BaseModel):
    display_name: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[str] = None
    current_province: Optional[str] = None
    current_district: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class RequestListingDeletion(BaseModel):
    listing_id: str
    reason: str

# ============= AUTH ENDPOINTS =============
@api_router.post("/auth/register/step1")
async def register_step1(data: RegisterStep1):
    """Step 1: Verify email domain uniqueness"""
    # Check email domain (must be government email)
    email_domain = data.email.split('@')[1]
    allowed_domains = ['adalet.gov.tr', 'meb.gov.tr', 'saglik.gov.tr', 'icisleri.gov.tr', 
                      'maliye.gov.tr', 'gov.tr']  # Add more as needed
    
    if not any(email_domain.endswith(domain) for domain in allowed_domains):
        raise HTTPException(status_code=400, detail="Sadece kurumsal (.gov.tr) e-posta adresleri ile kayıt olabilirsiniz")
    
    # Check if already registered
    existing = await db.users.find_one({"email": data.email})
    
    if existing:
        raise HTTPException(status_code=400, detail="Bu email ile zaten kayıtlı bir hesap var")
    
    # Create verification record
    verification_id = str(uuid.uuid4())
    verification = {
        "id": verification_id,
        "email": data.email,
        "password_hash": get_password_hash(data.password),
        "phone": None,
        "otp": None,
        "otp_expires": None,
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.verifications.insert_one(verification)
    
    return {"verification_id": verification_id, "message": "1. adım tamamlandı"}

@api_router.post("/auth/register/step2")
async def register_step2(data: RegisterStep2):
    """Step 2: Send OTP to phone"""
    verification = await db.verifications.find_one({"id": data.verification_id}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="Doğrulama kaydı bulunamadı")
    
    # Check phone uniqueness
    existing_user = await db.users.find_one({"phone": data.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu telefon numarası zaten kullanılıyor")
    
    # Generate OTP (mock for MVP)
    otp = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db.verifications.update_one(
        {"id": data.verification_id},
        {"$set": {
            "phone": data.phone,
            "otp": otp,
            "otp_expires": otp_expires.isoformat()
        }}
    )
    
    # In production, send SMS here
    # For MVP, return OTP in response (REMOVE IN PRODUCTION)
    return {"message": "OTP gönderildi", "otp_mock": otp}

@api_router.post("/auth/verify-otp")
async def verify_otp(data: VerifyOTP):
    """Step 3: Verify OTP and create user"""
    verification = await db.verifications.find_one({"id": data.verification_id}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="Doğrulama kaydı bulunamadı")
    
    if verification["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="OTP hatalı")
    
    otp_expires = datetime.fromisoformat(verification["otp_expires"])
    if datetime.now(timezone.utc) > otp_expires:
        raise HTTPException(status_code=400, detail="OTP süresi dolmuş")
    
    # Create user
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": verification["email"],
        "password_hash": verification["password_hash"],
        "phone": verification["phone"],
        "verified": True,
        "profile_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Mark verification as complete
    await db.verifications.update_one(
        {"id": data.verification_id},
        {"$set": {"verified": True}}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "message": "Kayıt başarılı"
    }

@api_router.post("/auth/login")
async def login(data: Login):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "profile_completed": user.get("profile_completed", False)
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "phone": current_user["phone"],
        "profile_completed": current_user.get("profile_completed", False),
        "profile": profile
    }

# ============= PROFILE ENDPOINTS =============
@api_router.post("/profile")
async def complete_profile(data: CompleteProfile, current_user: dict = Depends(get_current_user)):
    profile = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "display_name": data.display_name,
        "institution": data.institution,
        "role": data.role,
        "current_province": data.current_province,
        "current_district": data.current_district,
        "bio": data.bio,
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.profiles.insert_one(profile)
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"profile_completed": True}})
    
    return {"message": "Profil oluşturuldu", "profile": profile}

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profil bulunamadı")
    return profile

@api_router.put("/profile")
async def update_profile(data: UpdateProfile, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri yok")
    
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profil güncellendi"}

# ============= LISTING ENDPOINTS =============
@api_router.post("/listings")
async def create_listing(data: CreateListing, current_user: dict = Depends(get_current_user)):
    listing = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "title": data.title,
        "institution": data.institution,
        "role": data.role,
        "current_province": data.current_province,
        "current_district": data.current_district,
        "desired_province": data.desired_province,
        "desired_district": data.desired_district,
        "notes": data.notes,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.listings.insert_one(listing)
    
    return {"message": "İlan oluşturuldu", "listing": listing}

@api_router.get("/listings")
async def get_listings(
    title: Optional[str] = None,
    institution: Optional[str] = None,
    role: Optional[str] = None,
    current_province: Optional[str] = None,
    desired_province: Optional[str] = None,
    status: str = "active",
    limit: int = 50
):
    query = {"status": status}
    if title:
        query["title"] = {"$regex": title, "$options": "i"}
    if institution:
        query["institution"] = {"$regex": institution, "$options": "i"}
    if role:
        query["role"] = {"$regex": role, "$options": "i"}
    if current_province:
        query["current_province"] = current_province
    if desired_province:
        query["desired_province"] = desired_province
    
    listings = await db.listings.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with profile data
    for listing in listings:
        profile = await db.profiles.find_one({"user_id": listing["user_id"]}, {"_id": 0})
        listing["profile"] = profile
    
    return listings

@api_router.get("/listings/my")
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    listings = await db.listings.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return listings

@api_router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    profile = await db.profiles.find_one({"user_id": listing["user_id"]}, {"_id": 0})
    listing["profile"] = profile
    
    return listing

@api_router.put("/listings/{listing_id}")
async def update_listing(listing_id: str, data: UpdateListing, current_user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    if listing["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.listings.update_one({"id": listing_id}, {"$set": update_data})
    
    return {"message": "İlan güncellendi"}

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    if listing["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    # Instead of deleting, create a deletion request
    raise HTTPException(status_code=400, detail="İlan silme için admin onayı gereklidir. Lütfen silme isteği gönderin.")

@api_router.post("/listings/{listing_id}/request-deletion")
async def request_listing_deletion(listing_id: str, data: RequestListingDeletion, current_user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    if listing["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    # Check if already requested
    existing = await db.deletion_requests.find_one({
        "listing_id": listing_id,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Bu ilan için zaten bekleyen bir silme isteği var")
    
    # Create deletion request
    deletion_request = {
        "id": str(uuid.uuid4()),
        "listing_id": listing_id,
        "user_id": current_user["id"],
        "reason": data.reason,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.deletion_requests.insert_one(deletion_request)
    
    return {"message": "Silme isteği gönderildi. Admin onayı bekleniyor.", "request_id": deletion_request["id"]}

@api_router.get("/listings/deletion-requests/my")
async def get_my_deletion_requests(current_user: dict = Depends(get_current_user)):
    requests = await db.deletion_requests.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with listing data
    for req in requests:
        listing = await db.listings.find_one({"id": req["listing_id"]}, {"_id": 0})
        req["listing"] = listing
    
    return requests

# ============= INVITATION ENDPOINTS =============
@api_router.post("/invitations")
async def send_invitation(data: SendInvitation, current_user: dict = Depends(get_current_user)):
    # Rate limiting
    user_invitations = rate_limit_store[current_user["id"]]
    now = datetime.now(timezone.utc)
    user_invitations = [inv for inv in user_invitations if now - inv < timedelta(days=1)]
    
    if len(user_invitations) >= INVITATION_LIMIT_PER_DAY:
        raise HTTPException(status_code=429, detail=f"Günlük davet limiti ({INVITATION_LIMIT_PER_DAY}) aşıldı")
    
    # Get listing
    listing = await db.listings.find_one({"id": data.listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    if listing["user_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Kendi ilanınıza davet gönderemezsiniz")
    
    # Check if already invited
    existing = await db.invitations.find_one({
        "sender_id": current_user["id"],
        "listing_id": data.listing_id,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Bu ilana zaten davet gönderdiniz")
    
    # Create invitation
    invitation = {
        "id": str(uuid.uuid4()),
        "sender_id": current_user["id"],
        "receiver_id": listing["user_id"],
        "listing_id": data.listing_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.invitations.insert_one(invitation)
    
    # Update rate limit
    rate_limit_store[current_user["id"]].append(now)
    
    # Send notification
    await create_notification(
        listing["user_id"],
        "Yeni Davet",
        "İlanınıza yeni bir değişim daveti aldınız",
        "invitation"
    )
    
    return {"message": "Davet gönderildi", "invitation_id": invitation["id"]}

@api_router.get("/invitations")
async def get_invitations(current_user: dict = Depends(get_current_user)):
    sent = await db.invitations.find({"sender_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    received = await db.invitations.find({"receiver_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with listing and profile data
    for inv in sent + received:
        listing = await db.listings.find_one({"id": inv["listing_id"]}, {"_id": 0})
        inv["listing"] = listing
        
        sender_profile = await db.profiles.find_one({"user_id": inv["sender_id"]}, {"_id": 0})
        receiver_profile = await db.profiles.find_one({"user_id": inv["receiver_id"]}, {"_id": 0})
        inv["sender_profile"] = sender_profile
        inv["receiver_profile"] = receiver_profile
    
    return {"sent": sent, "received": received}

@api_router.post("/invitations/respond")
async def respond_invitation(data: RespondInvitation, current_user: dict = Depends(get_current_user)):
    invitation = await db.invitations.find_one({"id": data.invitation_id}, {"_id": 0})
    if not invitation:
        raise HTTPException(status_code=404, detail="Davet bulunamadı")
    
    if invitation["receiver_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    if invitation["status"] != "pending":
        raise HTTPException(status_code=400, detail="Bu davet zaten yanıtlanmış")
    
    if data.action not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Geçersiz işlem")
    
    # Update invitation
    await db.invitations.update_one(
        {"id": data.invitation_id},
        {"$set": {"status": data.action + "ed"}}
    )
    
    if data.action == "accept":
        # Create conversation
        conversation = {
            "id": str(uuid.uuid4()),
            "participants": [invitation["sender_id"], invitation["receiver_id"]],
            "invitation_id": data.invitation_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.conversations.insert_one(conversation)
        
        # Send notification to sender
        await create_notification(
            invitation["sender_id"],
            "Davet Kabul Edildi",
            "Gönderdiğiniz değişim daveti kabul edildi. Artık mesajlaşabilirsiniz!",
            "invitation_accepted"
        )
        
        return {"message": "Davet kabul edildi", "conversation_id": conversation["id"]}
    else:
        # Send notification to sender
        await create_notification(
            invitation["sender_id"],
            "Davet Reddedildi",
            "Gönderdiğiniz değişim daveti reddedildi",
            "invitation_rejected"
        )
        
        return {"message": "Davet reddedildi"}

# ============= CHAT ENDPOINTS =============
@api_router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    conversations = await db.conversations.find(
        {"participants": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with participant profiles and last message
    for conv in conversations:
        other_user_id = [p for p in conv["participants"] if p != current_user["id"]][0]
        other_profile = await db.profiles.find_one({"user_id": other_user_id}, {"_id": 0})
        
        # Get last message
        last_message = await db.messages.find(
            {"conversation_id": conv["id"]},
            {"_id": 0}
        ).sort("created_at", -1).limit(1).to_list(1)
        
        conv["other_user"] = other_profile
        conv["last_message"] = last_message[0] if last_message else None
    
    return conversations

@api_router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    # Verify access
    conversation = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
    if not conversation:
        raise HTTPException(status_code=404, detail="Konuşma bulunamadı")
    
    if current_user["id"] not in conversation["participants"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    
    # Get contact info (phone, email) for both users
    user1 = await db.users.find_one({"id": conversation["participants"][0]}, {"_id": 0, "phone": 1, "email": 1})
    user2 = await db.users.find_one({"id": conversation["participants"][1]}, {"_id": 0, "phone": 1, "email": 1})
    profile1 = await db.profiles.find_one({"user_id": conversation["participants"][0]}, {"_id": 0})
    profile2 = await db.profiles.find_one({"user_id": conversation["participants"][1]}, {"_id": 0})
    
    return {
        "messages": messages,
        "participants": [
            {**profile1, "phone": user1["phone"], "email": user1["email"]},
            {**profile2, "phone": user2["phone"], "email": user2["email"]}
        ]
    }

@api_router.post("/messages")
async def send_message(data: SendMessage, current_user: dict = Depends(get_current_user)):
    # Verify access
    conversation = await db.conversations.find_one({"id": data.conversation_id}, {"_id": 0})
    if not conversation:
        raise HTTPException(status_code=404, detail="Konuşma bulunamadı")
    
    if current_user["id"] not in conversation["participants"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    # Check if blocked
    other_user_id = [p for p in conversation["participants"] if p != current_user["id"]][0]
    block = await db.blocks.find_one({
        "blocker_id": other_user_id,
        "blocked_id": current_user["id"]
    })
    if block:
        raise HTTPException(status_code=403, detail="Bu kullanıcıya mesaj gönderemezsiniz")
    
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": data.conversation_id,
        "sender_id": current_user["id"],
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    
    # Send notification
    await create_notification(
        other_user_id,
        "Yeni Mesaj",
        "Size yeni bir mesaj geldi",
        "message"
    )
    
    return message

# ============= NOTIFICATION ENDPOINTS =============
@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return notifications

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Bildirim okundu olarak işaretlendi"}

# ============= BLOCK/REPORT ENDPOINTS =============
@api_router.post("/block")
async def block_user(data: BlockUser, current_user: dict = Depends(get_current_user)):
    if data.blocked_user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Kendinizi engelleyemezsiniz")
    
    # Check if already blocked
    existing = await db.blocks.find_one({
        "blocker_id": current_user["id"],
        "blocked_id": data.blocked_user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Bu kullanıcı zaten engellenmiş")
    
    block = {
        "id": str(uuid.uuid4()),
        "blocker_id": current_user["id"],
        "blocked_id": data.blocked_user_id,
        "reason": data.reason,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.blocks.insert_one(block)
    
    return {"message": "Kullanıcı engellendi"}

@api_router.get("/blocks")
async def get_blocks(current_user: dict = Depends(get_current_user)):
    blocks = await db.blocks.find({"blocker_id": current_user["id"]}, {"_id": 0}).to_list(100)
    
    # Enrich with profile data
    for block in blocks:
        profile = await db.profiles.find_one({"user_id": block["blocked_id"]}, {"_id": 0})
        block["blocked_profile"] = profile
    
    return blocks

# ============= ADMIN ENDPOINTS =============
ADMIN_USERNAME = "becayis"
ADMIN_PASSWORD = "1234"

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        is_admin = payload.get("is_admin", False)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token geçersiz")

@api_router.post("/admin/login")
async def admin_login(username: str, password: str):
    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")
    
    access_token = create_access_token(data={"sub": "admin", "is_admin": True})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"username": username, "role": "admin"}
    }

@api_router.get("/admin/users")
async def admin_get_users(admin = Depends(verify_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0, "tc_hash": 0, "registry_hash": 0}).to_list(1000)
    
    # Enrich with profile data
    for user in users:
        profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
        user["profile"] = profile
    
    return users

@api_router.get("/admin/listings")
async def admin_get_listings(admin = Depends(verify_admin)):
    listings = await db.listings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich with profile data
    for listing in listings:
        profile = await db.profiles.find_one({"user_id": listing["user_id"]}, {"_id": 0})
        listing["profile"] = profile
    
    return listings

@api_router.put("/admin/users/{user_id}/block")
async def admin_block_user(user_id: str, admin = Depends(verify_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"blocked": True, "blocked_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    return {"message": "Kullanıcı engellendi"}

@api_router.put("/admin/users/{user_id}/unblock")
async def admin_unblock_user(user_id: str, admin = Depends(verify_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"blocked": False}, "$unset": {"blocked_at": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    return {"message": "Kullanıcı engeli kaldırıldı"}

@api_router.delete("/admin/listings/{listing_id}")
async def admin_delete_listing(listing_id: str, admin = Depends(verify_admin)):
    result = await db.listings.delete_one({"id": listing_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    return {"message": "İlan silindi"}

@api_router.get("/admin/reports")
async def admin_get_reports(admin = Depends(verify_admin)):
    blocks = await db.blocks.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich with profile data
    for block in blocks:
        blocker = await db.profiles.find_one({"user_id": block["blocker_id"]}, {"_id": 0})
        blocked = await db.profiles.find_one({"user_id": block["blocked_id"]}, {"_id": 0})
        block["blocker_profile"] = blocker
        block["blocked_profile"] = blocked
    
    return blocks

@api_router.get("/admin/stats")
async def admin_get_stats(admin = Depends(verify_admin)):
    total_users = await db.users.count_documents({})
    total_listings = await db.listings.count_documents({})
    active_listings = await db.listings.count_documents({"status": "active"})
    total_invitations = await db.invitations.count_documents({})
    accepted_invitations = await db.invitations.count_documents({"status": "accepted"})
    total_conversations = await db.conversations.count_documents({})
    total_messages = await db.messages.count_documents({})
    pending_deletions = await db.deletion_requests.count_documents({"status": "pending"})
    
    return {
        "total_users": total_users,
        "total_listings": total_listings,
        "active_listings": active_listings,
        "total_invitations": total_invitations,
        "accepted_invitations": accepted_invitations,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "pending_deletions": pending_deletions
    }

@api_router.get("/admin/deletion-requests")
async def admin_get_deletion_requests(admin = Depends(verify_admin)):
    requests = await db.deletion_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich with listing and user data
    for req in requests:
        listing = await db.listings.find_one({"id": req["listing_id"]}, {"_id": 0})
        profile = await db.profiles.find_one({"user_id": req["user_id"]}, {"_id": 0})
        req["listing"] = listing
        req["user_profile"] = profile
    
    return requests

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin = Depends(verify_admin)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Delete user and all related data
    await db.users.delete_one({"id": user_id})
    await db.profiles.delete_many({"user_id": user_id})
    await db.listings.delete_many({"user_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    
    # TODO: Send email notification to user
    # send_email(user["email"], "Hesabınız Silindi", "...")
    
    return {"message": "Kullanıcı silindi"}

@api_router.post("/admin/deletion-requests/{request_id}/approve")
async def admin_approve_deletion(request_id: str, admin = Depends(verify_admin)):
    request = await db.deletion_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Silme isteği bulunamadı")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten işlenmiş")
    
    # Delete the listing
    await db.listings.delete_one({"id": request["listing_id"]})
    
    # Update request status
    await db.deletion_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "approved",
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send notification to user
    await create_notification(
        request["user_id"],
        "İlan Silme Onaylandı",
        "İlan silme isteğiniz onaylandı. İlanınız sistemden kaldırıldı.",
        "deletion_approved"
    )
    
    return {"message": "Silme isteği onaylandı ve ilan silindi"}

@api_router.post("/admin/deletion-requests/{request_id}/reject")
async def admin_reject_deletion(request_id: str, admin = Depends(verify_admin)):
    request = await db.deletion_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Silme isteği bulunamadı")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten işlenmiş")
    
    # Update request status
    await db.deletion_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "rejected",
            "rejected_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send notification to user
    await create_notification(
        request["user_id"],
        "İlan Silme Reddedildi",
        "İlan silme isteğiniz reddedildi. İlanınız sistemde kalmaya devam edecek.",
        "deletion_rejected"
    )
    
    return {"message": "Silme isteği reddedildi"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.delete_one({
        "id": notification_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    
    return {"message": "Bildirim silindi"}

# ============= UTILITY ENDPOINTS =============
@api_router.get("/utility/institutions")
async def get_institutions():
    """Return Turkish public institutions"""
    institutions = [
        "ADALET BAKANLIĞI",
        "MİLLİ EĞİTİM BAKANLIĞI",
        "SAĞLIK BAKANLIĞI",
        "İÇİŞLERİ BAKANLIĞI",
        "MALİYE VE HAZİNE BAKANLIĞI",
        "ÇEVRE, ŞEHİRCİLİK VE İKLİM DEĞİŞİKLİĞİ BAKANLIĞI",
        "TARIM VE ORMAN BAKANLIĞI",
        "ULAŞTIRMA VE ALTYAPI BAKANLIĞI",
        "TİCARET BAKANLIĞI",
        "ENERJİ VE TABİİ KAYNAKLAR BAKANLIĞI",
        "ÇALIŞMA VE SOSYAL GÜVENLİK BAKANLIĞI",
        "AİLE VE SOSYAL HİZMETLER BAKANLIĞI",
        "KÜLTÜR VE TURİZM BAKANLIĞI",
        "GENÇLİK VE SPOR BAKANLIĞI",
        "SANAYİ VE TEKNOLOJİ BAKANLIĞI"
    ]
    return institutions

@api_router.get("/utility/positions")
async def get_positions():
    """Return common public sector positions"""
    positions = [
        # Adalet Bakanlığı
        "Zabıt Katibi",
        "İcra Katibi",
        "Mübaşir",
        "İnfaz ve Koruma Memuru",
        "Adli Tıp Uzmanı",
        # Milli Eğitim
        "Öğretmen",
        "Okul Müdürü",
        "Müdür Yardımcısı",
        "Rehber Öğretmen",
        # Sağlık
        "Hemşire",
        "Ebe",
        "Sağlık Teknikeri",
        "Laborant",
        "Anestezi Teknisyeni",
        "Ameliyathane Teknisyeni",
        "Tıbbi Sekreter",
        "Doktor",
        "Uzman Doktor",
        # Genel Pozisyonlar
        "Memur",
        "Şef",
        "Müdür",
        "Teknisyen",
        "Mühendis",
        "Uzman",
        "Avukat",
        "Mali Hizmetler Uzmanı",
        "İdari Personel",
        "Bilgisayar İşletmeni",
        "Veri Hazırlama ve Kontrol İşletmeni"
    ]
    return sorted(positions)

@api_router.get("/provinces")
async def get_provinces():
    """Return Turkish provinces"""
    provinces = [
        "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", 
        "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", 
        "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", 
        "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
        "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
        "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis",
        "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
        "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize",
        "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas", "Tekirdağ", "Tokat",
        "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
    ]
    return provinces

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()