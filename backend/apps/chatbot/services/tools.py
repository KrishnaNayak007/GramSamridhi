import json

def get_pickup_schedule(user_id: str, location: str = "District X") -> str:
    """Fetch upcoming waste pickup schedule for a citizen based on location."""
    return json.dumps({
        "status": "success",
        "next_pickup": "Tomorrow, 8:30 AM",
        "waste_type": "Dry & Wet Segregated Waste",
        "collector_contact": "+91-9876543210"
    })

def report_waste_issue(user_id: str, description: str, category: str) -> str:
    """Submit a report for uncollected or overflowing waste. Category options: overflowing_bin, missed_pickup, illegal_dumping."""
    return json.dumps({
        "status": "success",
        "ticket_id": "TKT-2026-904",
        "message": "Report submitted successfully to the local sanitation authority."
    })

def list_crop_residue(farmer_id: str, crop_type: str, quantity_tons: float, price_per_ton: float = 0.0) -> str:
    """Create a marketplace listing for selling crop residue/stubble to industrial buyers."""
    return json.dumps({
        "status": "success",
        "listing_id": "RES-2026-11",
        "message": f"Successfully listed {quantity_tons} Tons of {crop_type} on the marketplace!"
    })

# Mapping dictionary for execution
TOOL_MAP = {
    "get_pickup_schedule": get_pickup_schedule,
    "report_waste_issue": report_waste_issue,
    "list_crop_residue": list_crop_residue,
}

# List of functions passed directly into the Gemini config
GEMINI_TOOLS = [get_pickup_schedule, report_waste_issue, list_crop_residue]