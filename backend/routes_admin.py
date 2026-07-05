from fastapi import APIRouter, HTTPException, Depends
from database import supabase
from auth_utils import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
async def get_stats(_=Depends(require_admin)):
    users = supabase.table("users").select("id, points").execute()
    orders = supabase.table("orders").select("id, status").execute()
    
    total_users = len(users.data)
    total_orders = len(orders.data)
    pending_orders = len([o for o in orders.data if o["status"] == "pending"])
    total_points = sum(u["points"] for u in users.data) if users.data else 0
    
    return {
        "totalUsers": total_users,
        "totalOrders": total_orders,
        "pendingOrders": pending_orders,
        "totalPoints": total_points
    }

@router.get("/users")
async def get_users(_=Depends(require_admin)):
    result = supabase.table("users").select("id, name, email, points, tier, join_date").execute()
    return result.data

@router.get("/users/{user_id}")
async def get_user(user_id: str, _=Depends(require_admin)):
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = result.data[0]
    orders = supabase.table("orders").select("*").eq("user_id", user_id).execute()
    activities = supabase.table("activities").select("*").eq("user_id", user_id).execute()
    
    return {
        "user": user,
        "orders": orders.data,
        "activities": activities.data
    }

@router.put("/users/{user_id}/coins")
async def update_coins(user_id: str, data: dict, _=Depends(require_admin)):
    points = data.get("points")
    if points is None:
        raise HTTPException(status_code=400, detail="Points value required")
    
    result = supabase.table("users").update({"points": points}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "new_points": points}

@router.get("/orders")
async def get_orders(_=Depends(require_admin)):
    result = supabase.table("orders").select("*").order("created_at", desc=True).execute()
    return result.data

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, data: dict, _=Depends(require_admin)):
    status = data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status required")
    
    result = supabase.table("orders").update({"status": status}).eq("id", order_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"success": True, "new_status": status}

