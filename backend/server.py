from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
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
import base64
import shutil
import json

# Import constants
from constants import INSTITUTIONS, POSITIONS, FAQ_DATA, PROVINCES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads" / "avatars"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

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
    
    # Send via WebSocket if user is connected
    await ws_manager.send_to_user(user_id, {
        "type": "notification",
        "data": notification
    })

# ============= WEBSOCKET MANAGER =============
class ConnectionManager:
    def __init__(self):
        # user_id -> list of websocket connections
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected: user {user_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected: user {user_id}")
    
    async def send_to_user(self, user_id: str, message: dict):
        """Send message to all connections of a specific user"""
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected:
                self.active_connections[user_id].remove(conn)
    
    async def broadcast_to_conversation(self, conversation_id: str, participants: List[str], message: dict):
        """Send message to all participants of a conversation"""
        for user_id in participants:
            await self.send_to_user(user_id, message)

ws_manager = ConnectionManager()

# ============= MODELS =============
class RegisterStep1(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class VerifyEmail(BaseModel):
    verification_id: str
    code: str

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
    listing_status: Optional[str] = None

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
    reason: str

class RequestAccountDeletion(BaseModel):
    reason: str

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    reset_token: str
    new_password: str

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

# ============= AUTH ENDPOINTS =============
@api_router.post("/auth/register/step1")
async def register_step1(data: RegisterStep1):
    """Step 1: Verify email and send verification code"""
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
    
    # Generate email verification code
    verification_code = generate_otp()
    code_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    # Create verification record
    verification_id = str(uuid.uuid4())
    verification = {
        "id": verification_id,
        "email": data.email,
        "password_hash": get_password_hash(data.password),
        "first_name": data.first_name,
        "last_name": data.last_name,
        "verification_code": verification_code,
        "code_expires": code_expires.isoformat(),
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.verifications.insert_one(verification)
    
    # TODO: In production, send email here
    # send_email(data.email, "Doğrulama Kodu", f"Kodunuz: {verification_code}")
    
    # For MVP, return code in response (REMOVE IN PRODUCTION)
    return {
        "verification_id": verification_id, 
        "message": "Doğrulama kodu e-posta adresinize gönderildi",
        "email_code_mock": verification_code  # Remove in production
    }

@api_router.post("/auth/verify-email")
async def verify_email(data: VerifyEmail):
    """Step 2: Verify email code and create user"""
    verification = await db.verifications.find_one({"id": data.verification_id}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="Doğrulama kaydı bulunamadı")
    
    if verification["verification_code"] != data.code:
        raise HTTPException(status_code=400, detail="Doğrulama kodu hatalı")
    
    code_expires = datetime.fromisoformat(verification["code_expires"])
    if datetime.now(timezone.utc) > code_expires:
        raise HTTPException(status_code=400, detail="Doğrulama kodunun süresi dolmuş")
    
    # Create user
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": verification["email"],
        "password_hash": verification["password_hash"],
        "first_name": verification["first_name"],
        "last_name": verification["last_name"],
        "verified": True,
        "profile_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Clean up verification
    await db.verifications.delete_one({"id": data.verification_id})
    
    # Generate token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "profile_completed": False
        }
    }

@api_router.post("/auth/resend-code")
async def resend_verification_code(verification_id: str):
    """Resend verification code"""
    verification = await db.verifications.find_one({"id": verification_id}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="Doğrulama kaydı bulunamadı")
    
    # Generate new code
    new_code = generate_otp()
    code_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    await db.verifications.update_one(
        {"id": verification_id},
        {"$set": {
            "verification_code": new_code,
            "code_expires": code_expires.isoformat()
        }}
    )
    
    # TODO: Send email in production
    return {
        "message": "Yeni doğrulama kodu gönderildi",
        "email_code_mock": new_code  # Remove in production
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
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "profile_completed": user.get("profile_completed", False)
        }
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPassword):
    """Send password reset code to email"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        # Don't reveal if email exists
        return {"message": "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama kodu gönderildi"}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    reset_code = generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    
    await db.password_resets.insert_one({
        "id": reset_token,
        "user_id": user["id"],
        "email": data.email,
        "code": reset_code,
        "expires": expires.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # TODO: Send email in production
    return {
        "message": "Şifre sıfırlama kodu e-posta adresinize gönderildi",
        "reset_token": reset_token,
        "reset_code_mock": reset_code  # Remove in production
    }

@api_router.post("/auth/verify-reset-code")
async def verify_reset_code(reset_token: str, code: str):
    """Verify password reset code"""
    reset = await db.password_resets.find_one({
        "id": reset_token,
        "used": False
    }, {"_id": 0})
    
    if not reset:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş sıfırlama talebi")
    
    expires = datetime.fromisoformat(reset["expires"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Sıfırlama kodunun süresi dolmuş")
    
    if reset["code"] != code:
        raise HTTPException(status_code=400, detail="Geçersiz doğrulama kodu")
    
    return {"message": "Kod doğrulandı", "verified": True}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPassword):
    """Reset password with token"""
    reset = await db.password_resets.find_one({
        "id": data.reset_token,
        "used": False
    }, {"_id": 0})
    
    if not reset:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş sıfırlama talebi")
    
    expires = datetime.fromisoformat(reset["expires"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Sıfırlama talebinin süresi dolmuş")
    
    # Update password
    new_hash = get_password_hash(data.new_password)
    await db.users.update_one(
        {"id": reset["user_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    # Mark reset as used
    await db.password_resets.update_one(
        {"id": data.reset_token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Şifreniz başarıyla değiştirildi"}

@api_router.post("/auth/change-password")
async def change_password(data: ChangePassword, current_user: dict = Depends(get_current_user)):
    """Change password for logged in user"""
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    if not verify_password(data.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    
    # Check if new password is same as current
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="Yeni şifre mevcut şifrenizle aynı olamaz")
    
    # Validate password requirements
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Şifre en az 8 karakter olmalıdır")
    
    import re
    if not re.search(r'[A-Z]', data.new_password):
        raise HTTPException(status_code=400, detail="Şifre en az 1 büyük harf içermelidir")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/]', data.new_password):
        raise HTTPException(status_code=400, detail="Şifre en az 1 özel karakter içermelidir")
    
    new_hash = get_password_hash(data.new_password)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Şifreniz başarıyla değiştirildi"}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "first_name": current_user.get("first_name", ""),
        "last_name": current_user.get("last_name", ""),
        "profile_completed": current_user.get("profile_completed", False),
        "created_at": current_user.get("created_at"),
        "profile": profile
    }

@api_router.post("/auth/request-account-deletion")
async def request_account_deletion(data: RequestAccountDeletion, current_user: dict = Depends(get_current_user)):
    """Request account deletion - requires admin approval"""
    user_id = current_user["id"]
    
    # Check if already has pending request
    existing = await db.account_deletion_requests.find_one({
        "user_id": user_id, 
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Zaten bekleyen bir hesap silme talebiniz var")
    
    request = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "reason": data.reason,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.account_deletion_requests.insert_one(request)
    
    return {"message": "Hesap silme talebiniz alındı. Admin onayından sonra hesabınız silinecektir."}

@api_router.get("/auth/account-deletion-status")
async def get_account_deletion_status(current_user: dict = Depends(get_current_user)):
    """Check if user has pending account deletion request"""
    request = await db.account_deletion_requests.find_one({
        "user_id": current_user["id"],
        "status": "pending"
    }, {"_id": 0})
    return {"has_pending_request": request is not None, "request": request}

# ============= POSITIONS ENDPOINT =============
@api_router.get("/positions")
async def get_positions():
    """Get list of available positions"""
    return POSITIONS

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
    
    # Remove MongoDB _id before returning
    profile.pop("_id", None)
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

@api_router.post("/profile/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload profile avatar"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Sadece JPEG, PNG, WebP veya GIF dosyaları kabul edilir")
    
    # Validate file size (max 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dosya boyutu 5MB'dan küçük olmalıdır")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{current_user['id']}_{uuid.uuid4().hex[:8]}.{file_ext}"
    file_path = UPLOADS_DIR / filename
    
    # Delete old avatar if exists
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if profile and profile.get("avatar_url"):
        old_filename = profile["avatar_url"].split("/")[-1]
        old_path = UPLOADS_DIR / old_filename
        if old_path.exists():
            old_path.unlink()
    
    # Save new file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update profile with avatar URL
    avatar_url = f"/api/uploads/avatars/{filename}"
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"avatar_url": avatar_url}}
    )
    
    return {"message": "Profil fotoğrafı yüklendi", "avatar_url": avatar_url}

@api_router.delete("/profile/avatar")
async def delete_avatar(current_user: dict = Depends(get_current_user)):
    """Delete profile avatar"""
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not profile or not profile.get("avatar_url"):
        raise HTTPException(status_code=404, detail="Profil fotoğrafı bulunamadı")
    
    # Delete file
    filename = profile["avatar_url"].split("/")[-1]
    file_path = UPLOADS_DIR / filename
    if file_path.exists():
        file_path.unlink()
    
    # Update profile
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"avatar_url": None}}
    )
    
    return {"message": "Profil fotoğrafı silindi"}

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
    
    # Remove MongoDB _id before returning
    listing.pop("_id", None)
    return {"message": "İlan oluşturuldu", "listing": listing}

@api_router.get("/listings")
async def get_listings(
    title: Optional[str] = None,
    institution: Optional[str] = None,
    role: Optional[str] = None,
    current_province: Optional[str] = None,
    desired_province: Optional[str] = None,
    province: Optional[str] = None,  # New: search both current and desired province
    listing_status: str = "active",
    limit: int = 50
):
    query = {"status": listing_status}
    
    # Build search conditions
    or_conditions = []
    
    if title:
        or_conditions.append({"title": {"$regex": title, "$options": "i"}})
        or_conditions.append({"institution": {"$regex": title, "$options": "i"}})
        or_conditions.append({"role": {"$regex": title, "$options": "i"}})  # Also search in role/position
    
    if institution:
        query["institution"] = {"$regex": institution, "$options": "i"}
    if role:
        or_conditions.append({"role": {"$regex": role, "$options": "i"}})
    if current_province:
        query["current_province"] = current_province
    if desired_province:
        query["desired_province"] = desired_province
    # Search both current and desired province
    if province:
        or_conditions.append({"current_province": province})
        or_conditions.append({"desired_province": province})
    
    # Combine OR conditions if any
    if or_conditions:
        if "$or" in query:
            query["$and"] = [{"$or": query.pop("$or")}, {"$or": or_conditions}]
        else:
            query["$or"] = or_conditions
    
    listings = await db.listings.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with profile data and user info for initials
    for listing in listings:
        profile = await db.profiles.find_one({"user_id": listing["user_id"]}, {"_id": 0})
        listing["profile"] = profile
        
        # Get user for initials
        user = await db.users.find_one({"id": listing["user_id"]}, {"_id": 0, "first_name": 1, "last_name": 1})
        if user:
            first_initial = user.get("first_name", "?")[0].upper() if user.get("first_name") else "?"
            last_initial = user.get("last_name", "?")[0].upper() if user.get("last_name") else "?"
            listing["user_initials"] = f"{first_initial}{last_initial}"
        else:
            listing["user_initials"] = "??"
    
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
    
    # Check if user is blocked
    block = await db.blocks.find_one({
        "$or": [
            {"blocker_id": listing["user_id"], "blocked_id": current_user["id"]},
            {"blocker_id": current_user["id"], "blocked_id": listing["user_id"]}
        ]
    })
    if block:
        raise HTTPException(status_code=400, detail="Bu kullanıcıya davet gönderemezsiniz")
    
    # Check if already invited (any status - prevent duplicate invitations)
    existing = await db.invitations.find_one({
        "sender_id": current_user["id"],
        "listing_id": data.listing_id
    })
    if existing:
        if existing["status"] == "pending":
            raise HTTPException(status_code=400, detail="Bu ilana zaten bekleyen bir davetiniz var")
        elif existing["status"] == "accepted":
            raise HTTPException(status_code=400, detail="Bu davet zaten kabul edilmiş")
        elif existing["status"] == "rejected":
            raise HTTPException(status_code=400, detail="Bu ilana daha önce davet gönderdiniz ve reddedildi")
    
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

@api_router.delete("/invitations/{invitation_id}")
async def delete_invitation(invitation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an invitation (sent or received)"""
    invitation = await db.invitations.find_one({"id": invitation_id}, {"_id": 0})
    if not invitation:
        raise HTTPException(status_code=404, detail="Davet bulunamadı")
    
    # Check if user is sender or receiver
    if invitation["sender_id"] != current_user["id"] and invitation["receiver_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    await db.invitations.delete_one({"id": invitation_id})
    return {"message": "Davet silindi"}

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
    
    # Remove MongoDB _id before returning
    message.pop("_id", None)
    return message

@api_router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a conversation and all its messages"""
    conversation = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
    if not conversation:
        raise HTTPException(status_code=404, detail="Konuşma bulunamadı")
    
    if current_user["id"] not in conversation["participants"]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    # Get other participant to send notification
    other_user_id = [p for p in conversation["participants"] if p != current_user["id"]][0]
    
    # Get current user's profile for notification message
    current_profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    display_name = current_profile.get("display_name", "Bir kullanıcı") if current_profile else "Bir kullanıcı"
    
    # Delete all messages in the conversation
    await db.messages.delete_many({"conversation_id": conversation_id})
    
    # Delete the conversation
    await db.conversations.delete_one({"id": conversation_id})
    
    # Send notification to other user
    await create_notification(
        other_user_id,
        "Konuşma Sonlandırıldı",
        f"{display_name} sizinle olan konuşmayı sonlandırdı",
        "conversation_ended"
    )
    
    return {"message": "Konuşma silindi"}

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

@api_router.delete("/blocks/{blocked_user_id}")
async def unblock_user(blocked_user_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a user block"""
    result = await db.blocks.delete_one({
        "blocker_id": current_user["id"],
        "blocked_id": blocked_user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Engel bulunamadı")
    
    return {"message": "Engel kaldırıldı"}

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
    # First check hardcoded admin (fallback for initial setup)
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        # Ensure admin exists in admins collection
        existing = await db.admins.find_one({"username": ADMIN_USERNAME})
        if not existing:
            await db.admins.insert_one({
                "id": str(uuid.uuid4()),
                "username": ADMIN_USERNAME,
                "password_hash": get_password_hash(ADMIN_PASSWORD),
                "display_name": "Becayiş Admin",
                "role": "admin",  # Default to regular admin, can be promoted later
                "avatar_url": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "system"
            })
            existing = await db.admins.find_one({"username": ADMIN_USERNAME})
        
        # Get actual role from database
        actual_role = existing.get("role", "admin")
        access_token = create_access_token(data={"sub": "admin", "is_admin": True, "username": username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"username": username, "role": actual_role}
        }
    
    # Check admins collection
    admin = await db.admins.find_one({"username": username}, {"_id": 0})
    if admin and verify_password(password, admin.get("password_hash", "")):
        access_token = create_access_token(data={"sub": "admin", "is_admin": True, "username": username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"username": username, "role": admin.get("role", "admin")}
        }
    
    raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")

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

@api_router.delete("/admin/deletion-requests/{request_id}")
async def admin_delete_deletion_request(request_id: str, admin = Depends(verify_admin)):
    """Delete a deletion request (for cleanup purposes)"""
    request = await db.deletion_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Silme isteği bulunamadı")
    
    await db.deletion_requests.delete_one({"id": request_id})
    return {"message": "Silme isteği temizlendi"}

# ============= ADMIN ACCOUNT DELETION REQUESTS =============
@api_router.get("/admin/account-deletion-requests")
async def get_account_deletion_requests(admin = Depends(verify_admin)):
    """Get all account deletion requests"""
    requests = await db.account_deletion_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Attach user info
    for req in requests:
        user = await db.users.find_one({"id": req["user_id"]}, {"_id": 0})
        profile = await db.profiles.find_one({"user_id": req["user_id"]}, {"_id": 0})
        req["user"] = user
        req["profile"] = profile
    
    return requests

@api_router.post("/admin/account-deletion-requests/{request_id}/approve")
async def approve_account_deletion(request_id: str, admin = Depends(verify_admin)):
    """Approve account deletion request and delete user"""
    request = await db.account_deletion_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Silme talebi bulunamadı")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Bu talep zaten işlenmiş")
    
    user_id = request["user_id"]
    
    # Delete all user data
    await db.users.delete_one({"id": user_id})
    await db.profiles.delete_many({"user_id": user_id})
    await db.listings.delete_many({"user_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    await db.invitations.delete_many({"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]})
    await db.conversations.delete_many({"participants": user_id})
    await db.messages.delete_many({"sender_id": user_id})
    await db.deletion_requests.delete_many({"user_id": user_id})
    
    # Update request status
    await db.account_deletion_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Hesap silme talebi onaylandı ve kullanıcı silindi"}

@api_router.post("/admin/account-deletion-requests/{request_id}/reject")
async def reject_account_deletion(request_id: str, admin = Depends(verify_admin)):
    """Reject account deletion request"""
    request = await db.account_deletion_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Silme talebi bulunamadı")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Bu talep zaten işlenmiş")
    
    await db.account_deletion_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "rejected", "rejected_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Notify user
    await create_notification(
        request["user_id"],
        "Hesap Silme Reddedildi",
        "Hesap silme talebiniz reddedildi.",
        "account_deletion_rejected"
    )
    
    return {"message": "Hesap silme talebi reddedildi"}

@api_router.delete("/admin/account-deletion-requests/{request_id}")
async def clear_account_deletion_request(request_id: str, admin = Depends(verify_admin)):
    """Clear an account deletion request"""
    await db.account_deletion_requests.delete_one({"id": request_id})
    return {"message": "Hesap silme talebi temizlendi"}

# ============= ADMIN MANAGEMENT ENDPOINTS =============
class CreateAdmin(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None
    role: Optional[str] = "admin"  # "main_admin" or "admin"

class UpdateAdminPassword(BaseModel):
    admin_id: str
    new_password: str

class UpdateAdminRole(BaseModel):
    admin_id: str
    new_role: str  # "main_admin" or "admin"

class TransferMainAdmin(BaseModel):
    new_main_admin_id: str
    password: str  # Current main admin's password for confirmation

class UpdateAdminProfile(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

@api_router.get("/admin/admins")
async def get_admins(admin = Depends(verify_admin)):
    """Get list of all admins"""
    admins = await db.admins.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return admins

@api_router.get("/admin/me")
async def get_current_admin(admin = Depends(verify_admin)):
    """Get current admin's profile"""
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0, "password_hash": 0})
    if not current_admin:
        raise HTTPException(status_code=404, detail="Admin bulunamadı")
    return current_admin

@api_router.post("/admin/admins")
async def create_admin(data: CreateAdmin, admin = Depends(verify_admin)):
    """Create a new admin"""
    # Only main admin can create admins
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0})
    if not current_admin or current_admin.get("role") != "main_admin":
        raise HTTPException(status_code=403, detail="Sadece ana admin yeni admin oluşturabilir")
    
    # Check if username exists
    existing = await db.admins.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor")
    
    # Validate password
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Şifre en az 8 karakter olmalıdır")
    
    import re
    if not re.search(r'[A-Z]', data.password):
        raise HTTPException(status_code=400, detail="Şifre en az 1 büyük harf içermelidir")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/]', data.password):
        raise HTTPException(status_code=400, detail="Şifre en az 1 özel karakter içermelidir")
    
    # New admins can only be regular admins, not main_admin
    new_role = "admin"
    
    new_admin = {
        "id": str(uuid.uuid4()),
        "username": data.username,
        "password_hash": get_password_hash(data.password),
        "display_name": data.display_name or data.username,
        "role": new_role,
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin["username"]
    }
    
    await db.admins.insert_one(new_admin)
    
    return {"message": "Admin başarıyla oluşturuldu", "admin_id": new_admin["id"]}

@api_router.put("/admin/admins/{admin_id}/password")
async def update_admin_password(admin_id: str, data: UpdateAdminPassword, admin = Depends(verify_admin)):
    """Update admin password"""
    target_admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Admin bulunamadı")
    
    # Validate password
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Şifre en az 8 karakter olmalıdır")
    
    import re
    if not re.search(r'[A-Z]', data.new_password):
        raise HTTPException(status_code=400, detail="Şifre en az 1 büyük harf içermelidir")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/]', data.new_password):
        raise HTTPException(status_code=400, detail="Şifre en az 1 özel karakter içermelidir")
    
    await db.admins.update_one(
        {"id": admin_id},
        {"$set": {"password_hash": get_password_hash(data.new_password)}}
    )
    
    return {"message": "Admin şifresi güncellendi"}

@api_router.delete("/admin/admins/{admin_id}")
async def delete_admin(admin_id: str, admin = Depends(verify_admin)):
    """Delete an admin"""
    target_admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Admin bulunamadı")
    
    # Prevent deleting the main admin (check role only, not username)
    if target_admin.get("role") == "main_admin":
        raise HTTPException(status_code=400, detail="Ana admin silinemez")
    
    # Only main admin can delete other admins
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0})
    if not current_admin or current_admin.get("role") != "main_admin":
        raise HTTPException(status_code=403, detail="Sadece ana admin diğer adminleri silebilir")
    
    # Prevent self-deletion
    if target_admin["username"] == admin["username"]:
        raise HTTPException(status_code=400, detail="Kendinizi silemezsiniz")
    
    await db.admins.delete_one({"id": admin_id})
    return {"message": "Admin silindi"}

@api_router.put("/admin/admins/{admin_id}/role")
async def update_admin_role(admin_id: str, data: UpdateAdminRole, admin = Depends(verify_admin)):
    """Update admin role - only main admin can do this"""
    # Only main admin can change roles (check role from database)
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0})
    is_main_admin = current_admin and current_admin.get("role") == "main_admin"
    
    if not is_main_admin:
        raise HTTPException(status_code=403, detail="Sadece ana admin yetki değiştirebilir")
    
    target_admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Admin bulunamadı")
    
    if data.new_role not in ["admin", "main_admin"]:
        raise HTTPException(status_code=400, detail="Geçersiz rol. 'admin' veya 'main_admin' olmalı")
    
    # Cannot change own role to regular admin (would lose main admin)
    if target_admin["username"] == admin["username"] and data.new_role == "admin":
        raise HTTPException(status_code=400, detail="Kendi yetkinizi düşüremezsiniz. Ana admin devri yapın.")
    
    await db.admins.update_one(
        {"id": admin_id},
        {"$set": {"role": data.new_role}}
    )
    
    return {"message": f"Admin yetkisi '{data.new_role}' olarak güncellendi"}

@api_router.post("/admin/transfer-main-admin")
async def transfer_main_admin(data: TransferMainAdmin, admin = Depends(verify_admin)):
    """Transfer main admin role to another admin - requires password confirmation"""
    # Only main admin can transfer
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0})
    is_main_admin = current_admin and current_admin.get("role") == "main_admin"
    
    if not is_main_admin:
        raise HTTPException(status_code=403, detail="Sadece ana admin bu işlemi yapabilir")
    
    # Verify password - check database password hash
    if not current_admin or not verify_password(data.password, current_admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Şifre hatalı")
    
    # Get target admin
    target_admin = await db.admins.find_one({"id": data.new_main_admin_id}, {"_id": 0})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Hedef admin bulunamadı")
    
    # Cannot transfer to self
    if target_admin["username"] == admin["username"]:
        raise HTTPException(status_code=400, detail="Kendinize devir yapamazsınız")
    
    # Update target admin to main_admin
    await db.admins.update_one(
        {"id": data.new_main_admin_id},
        {"$set": {"role": "main_admin"}}
    )
    
    # Demote current main admin to regular admin
    await db.admins.update_one(
        {"username": admin["username"]},
        {"$set": {"role": "admin"}}
    )
    
    return {"message": f"Ana admin yetkisi '{target_admin['display_name'] or target_admin['username']}' kullanıcısına devredildi"}

@api_router.put("/admin/profile")
async def update_admin_profile(data: UpdateAdminProfile, admin = Depends(verify_admin)):
    """Update current admin's profile (display name, avatar)"""
    update_data = {}
    
    if data.display_name is not None:
        update_data["display_name"] = data.display_name
    
    if data.avatar_url is not None:
        update_data["avatar_url"] = data.avatar_url
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri yok")
    
    result = await db.admins.update_one(
        {"username": admin["username"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Admin bulunamadı")
    
    return {"message": "Profil güncellendi"}

@api_router.post("/admin/avatar")
async def upload_admin_avatar(file: UploadFile = File(...), admin = Depends(verify_admin)):
    """Upload admin profile avatar"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Sadece JPEG, PNG, WebP veya GIF dosyaları kabul edilir")
    
    # Validate file size (max 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dosya boyutu 5MB'dan küçük olmalıdır")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"admin_{admin['username']}_{uuid.uuid4().hex[:8]}.{file_ext}"
    file_path = UPLOADS_DIR / filename
    
    # Delete old avatar if exists
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0})
    if current_admin and current_admin.get("avatar_url"):
        old_filename = current_admin["avatar_url"].split("/")[-1]
        old_path = UPLOADS_DIR / old_filename
        if old_path.exists():
            old_path.unlink()
    
    # Save new file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update admin profile with avatar URL
    avatar_url = f"/api/uploads/avatars/{filename}"
    await db.admins.update_one(
        {"username": admin["username"]},
        {"$set": {"avatar_url": avatar_url}}
    )
    
    return {"message": "Profil fotoğrafı yüklendi", "avatar_url": avatar_url}

@api_router.delete("/admin/avatar")
async def delete_admin_avatar(admin = Depends(verify_admin)):
    """Delete admin profile avatar"""
    current_admin = await db.admins.find_one({"username": admin["username"]}, {"_id": 0})
    if not current_admin or not current_admin.get("avatar_url"):
        raise HTTPException(status_code=404, detail="Profil fotoğrafı bulunamadı")
    
    # Delete file
    filename = current_admin["avatar_url"].split("/")[-1]
    file_path = UPLOADS_DIR / filename
    if file_path.exists():
        file_path.unlink()
    
    # Update profile
    await db.admins.update_one(
        {"username": admin["username"]},
        {"$set": {"avatar_url": None}}
    )
    
    return {"message": "Profil fotoğrafı silindi"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.delete_one({
        "id": notification_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    
    return {"message": "Bildirim silindi"}

# ============= LISTING STATISTICS ENDPOINTS =============
@api_router.get("/stats/top-positions")
async def get_top_positions(limit: int = 10):
    """Get most listed positions with counts"""
    pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$role", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    results = await db.listings.aggregate(pipeline).to_list(limit)
    return [{"position": r["_id"], "count": r["count"]} for r in results if r["_id"]]

@api_router.get("/stats/top-institutions")
async def get_top_institutions(limit: int = 10):
    """Get most listed institutions with counts"""
    pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$institution", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    results = await db.listings.aggregate(pipeline).to_list(limit)
    return [{"institution": r["_id"], "count": r["count"]} for r in results if r["_id"]]

# ============= UTILITY ENDPOINTS =============
@api_router.get("/utility/institutions")
async def get_institutions_list():
    """Return Turkish public institutions from constants"""
    return INSTITUTIONS

@api_router.get("/institutions")
async def get_institutions_alt():
    """Return Turkish public institutions (alternative endpoint)"""
    return INSTITUTIONS

@api_router.get("/utility/positions")
async def get_positions_list():
    """Return common public sector positions from constants"""
    return sorted(POSITIONS)

@api_router.get("/provinces")
async def get_provinces():
    """Return Turkish provinces from constants"""
    return PROVINCES

@api_router.get("/districts/{province}")
async def get_districts(province: str):
    """Return districts for a given province"""
    from constants import DISTRICTS
    return DISTRICTS.get(province, [])

@api_router.get("/faq")
async def get_faq():
    """Return FAQ data from constants"""
    return FAQ_DATA

# Include the router in the main app
app.include_router(api_router)

# Mount static files for avatar uploads
app.mount("/api/uploads", StaticFiles(directory=str(ROOT_DIR / "uploads")), name="uploads")

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

# ============= WEBSOCKET ENDPOINT =============
@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time messaging"""
    try:
        # Verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except JWTError:
        await websocket.close(code=4001)
        return
    
    await ws_manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "message":
                conversation_id = data.get("conversation_id")
                content = data.get("content")
                
                if not conversation_id or not content:
                    continue
                
                # Get conversation
                conversation = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
                if not conversation or user_id not in conversation["participants"]:
                    continue
                
                # Check if blocked
                other_user_id = [p for p in conversation["participants"] if p != user_id][0]
                block = await db.blocks.find_one({
                    "blocker_id": other_user_id,
                    "blocked_id": user_id
                })
                if block:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Bu kullanıcıya mesaj gönderemezsiniz"
                    })
                    continue
                
                # Create message
                message = {
                    "id": str(uuid.uuid4()),
                    "conversation_id": conversation_id,
                    "sender_id": user_id,
                    "content": content,
                    "read": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.messages.insert_one(message)
                
                # Update conversation last message
                await db.conversations.update_one(
                    {"id": conversation_id},
                    {"$set": {
                        "last_message": {
                            "content": content[:50] + "..." if len(content) > 50 else content,
                            "sender_id": user_id,
                            "created_at": message["created_at"],
                            "read": False
                        }
                    }}
                )
                
                # Get sender profile
                sender_profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0})
                
                # Broadcast to all participants
                await ws_manager.broadcast_to_conversation(
                    conversation_id,
                    conversation["participants"],
                    {
                        "type": "new_message",
                        "conversation_id": conversation_id,
                        "message": {
                            **message,
                            "sender_profile": sender_profile
                        }
                    }
                )
            
            elif data.get("type") == "typing":
                conversation_id = data.get("conversation_id")
                conversation = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
                if conversation and user_id in conversation["participants"]:
                    other_user_id = [p for p in conversation["participants"] if p != user_id][0]
                    await ws_manager.send_to_user(other_user_id, {
                        "type": "typing",
                        "conversation_id": conversation_id,
                        "user_id": user_id
                    })
            
            elif data.get("type") == "read":
                conversation_id = data.get("conversation_id")
                # Mark messages as read
                await db.messages.update_many(
                    {
                        "conversation_id": conversation_id,
                        "sender_id": {"$ne": user_id},
                        "read": False
                    },
                    {"$set": {"read": True}}
                )
                # Update conversation last message read status
                await db.conversations.update_one(
                    {"id": conversation_id, "last_message.sender_id": {"$ne": user_id}},
                    {"$set": {"last_message.read": True}}
                )
                
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket, user_id)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()