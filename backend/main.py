import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from routes_auth import router as auth_router
from routes_orders import router as orders_router
from routes_cart import router as cart_router
from routes_admin import router as admin_router

app = FastAPI(title="EcoAI API", version="1.0.0")

# Default CORS origins for development
default_origins = ["http://localhost:3000", "http://localhost:3001", "http://192.168.31.252:3000"]

# Allow production origins from environment
production_origins = os.getenv("CORS_ORIGINS", "").split(",")
production_origins = [o.strip() for o in production_origins if o.strip()]

allowed_origins = default_origins + production_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression for responses > 500 bytes
app.add_middleware(GZipMiddleware, minimum_size=500)

app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(cart_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"message": "EcoAI API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
