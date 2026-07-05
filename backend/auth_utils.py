import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Header
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = "HS256"
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")

if SECRET_KEY == "your-secret-key":
    import warnings
    warnings.warn(
        "⚠️  Using default JWT_SECRET! Set a strong JWT_SECRET in .env for production.",
        stacklevel=2,
    )

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def extract_token(authorization: Optional[str] = Header(None), token: Optional[str] = None) -> str:
    """Extract JWT token from Authorization header (preferred) or query param (fallback)."""
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    if token:
        return token
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")

async def get_current_user(authorization: Optional[str] = Header(None), token: Optional[str] = None):
    """Dependency to get the current authenticated user from token."""
    from database import supabase
    raw_token = extract_token(authorization, token)
    payload = verify_token(raw_token)
    result = supabase.table("users").select("*").eq("id", payload["user_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]

async def require_admin(x_admin_key: Optional[str] = Header(None)):
    """Dependency to verify admin access via API key header."""
    if not ADMIN_API_KEY:
        return True  # No admin key configured, allow access (dev mode)
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
