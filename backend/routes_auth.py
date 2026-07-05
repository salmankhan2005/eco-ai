from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel, EmailStr
from database import supabase
from auth_utils import hash_password, verify_password, create_access_token, get_current_user, extract_token, verify_token
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UpdateRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/register")
async def register(data: RegisterRequest):
    # Check if user exists
    existing = supabase.table("users").select("*").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user with 500 initial credits
    user_data = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "points": 500,
        "tier": "Bronze",
        "join_date": datetime.now(timezone.utc).isoformat(),
        "recycled": 0
    }
    
    result = supabase.table("users").insert(user_data).execute()
    user = result.data[0]
    
    # Create welcome activity
    supabase.table("activities").insert({
        "user_id": user["id"],
        "type": "bonus",
        "date": datetime.now(timezone.utc).isoformat(),
        "description": "Welcome bonus - 500 credits",
        "points": 500
    }).execute()
    
    # Auto-login: Create token
    token = create_access_token({"user_id": user["id"], "email": user["email"]})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "points": user["points"],
            "tier": user["tier"],
            "wallet_address": user.get("wallet_address")
        }
    }

@router.post("/login")
async def login(data: LoginRequest):
    # Find user
    result = supabase.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = result.data[0]
    
    # Verify password
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_access_token({"user_id": user["id"], "email": user["email"]})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "points": user["points"],
            "tier": user["tier"],
            "wallet_address": user.get("wallet_address")
        }
    }

@router.post("/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}

@router.get("/me")
async def get_current_user_route(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = None
):
    raw_token = extract_token(authorization, token)
    payload = verify_token(raw_token)
    
    result = supabase.table("users").select("*").eq("id", payload["user_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = result.data[0]
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "points": user["points"],
        "tier": user["tier"],
        "recycled": user["recycled"],
        "wallet_address": user.get("wallet_address")
    }

@router.put("/update/{user_id}")
async def update_user(user_id: str, data: UpdateRequest, current_user: dict = Depends(get_current_user)):
    # Verify user is updating their own profile
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot update another user's profile")
    
    result = supabase.table("users").update({
        "name": data.name,
        "email": data.email
    }).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "Profile updated successfully"}

@router.delete("/delete/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # Verify user is deleting their own account
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's account")
    
    result = supabase.table("users").delete().eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "Account deleted successfully"}

@router.post("/wallet")
async def update_wallet(data: dict, current_user: dict = Depends(get_current_user)):
    """Update user's wallet address."""
    wallet_address = data.get("walletAddress")
    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address required")
    
    result = supabase.table("users").update({
        "wallet_address": wallet_address
    }).eq("id", current_user["id"]).execute()
    
    return {"success": True, "walletAddress": wallet_address}

