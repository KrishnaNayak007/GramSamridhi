import json

def get_pickup_schedule(user_id: str = "guest_user", location: str = "District X") -> str:
    """Fetch upcoming waste pickup schedule for a citizen based on location."""
    return json.dumps({
        "status": "success",
        "next_pickup": "Tomorrow, 8:30 AM",
        "waste_type": "Dry & Wet Segregated Waste",
        "collector_contact": "+91-9876543210"
    })

def report_waste_issue(user_id: str = "guest_user", description: str = "", category: str = "overflowing_bin") -> str:
    """Submit a report for uncollected or overflowing waste. Category options: overflowing_bin, missed_pickup, illegal_dumping."""
    return json.dumps({
        "status": "success",
        "ticket_id": "TKT-2026-904",
        "message": "Report submitted successfully to the local sanitation authority."
    })

def list_crop_residue(farmer_id: str = "farmer_1", crop_type: str = "paddy straw", quantity_tons: float = 1.0, price_per_ton: float = 0.0) -> str:
    """Create a marketplace listing for selling crop residue/stubble to industrial buyers."""
    return json.dumps({
        "status": "success",
        "listing_id": "RES-2026-11",
        "message": f"Successfully listed {quantity_tons} Tons of {crop_type} on the marketplace!"
    })

# Tool dictionary mapping for automatic backend execution
TOOL_MAP = {
    "get_pickup_schedule": get_pickup_schedule,
    "report_waste_issue": report_waste_issue,
    "list_crop_residue": list_crop_residue,
}

# Pass pure python functions directly to Gemini config
GEMINI_TOOLS = [get_pickup_schedule, report_waste_issue, list_crop_residue]
