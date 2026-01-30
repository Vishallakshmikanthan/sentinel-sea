"""
Sentinel-Sea Backend API
FastAPI server for maritime surveillance data streaming
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
from datetime import datetime
import random
from typing import List, Dict
import numpy as np

app = FastAPI(
    title="Sentinel-Sea API",
    description="Maritime surveillance backend for dark vessel detection",
    version="1.0.0"
)

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Marine Protected Area definition (Gulf of Mannar - realistic ocean boundaries)
GULF_OF_MANNAR_MPA = {
    "name": "Gulf of Mannar MPA",
    "bounds": {
        "lat_min": 8.5,
        "lat_max": 9.3,
        "lon_min": 78.0,
        "lon_max": 79.5
    }
}


class VesselDetector:
    """Simulates SAR vessel detection using CFAR-like logic"""
    
    def generate_sar_detection(self):
        """Generate a synthetic SAR detection in ocean areas only"""
        # Gulf of Mannar ocean coordinates (between India and Sri Lanka)
        # These are realistic ocean locations, NOT on land
        ocean_zones = [
            # Zone 1: Northern Gulf of Mannar
            {"lat_min": 8.8, "lat_max": 9.3, "lon_min": 78.1, "lon_max": 79.5},
            # Zone 2: Central Gulf of Mannar  
            {"lat_min": 8.5, "lat_max": 9.0, "lon_min": 78.0, "lon_max": 79.3},
            # Zone 3: Southern approaches
            {"lat_min": 8.2, "lat_max": 8.7, "lon_min": 77.8, "lon_max": 79.0},
        ]
        
        # Randomly select an ocean zone
        zone = random.choice(ocean_zones)
        
        # Generate coordinates within ocean zone
        lat = random.uniform(zone["lat_min"], zone["lat_max"])
        lon = random.uniform(zone["lon_min"], zone["lon_max"])
        
        # SAR-derived features
        area = random.uniform(50, 500)  # square meters
        intensity = random.uniform(100, 255)  # backscatter intensity
        elongation = random.uniform(2.5, 6.0)  # length/width ratio
        
        return {
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "area": round(area, 2),
            "intensity": round(intensity, 2),
            "elongation": round(elongation, 2)
        }


class AISMatcher:
    """Simulates AIS signal matching"""
    
    def __init__(self):
        # 70% of vessels broadcast AIS, 30% are "dark"
        self.ais_probability = 0.7
    
    def check_ais_signal(self, sar_detection: Dict) -> bool:
        """Check if SAR detection has corresponding AIS signal"""
        return random.random() < self.ais_probability


class ThreatClassifier:
    """Random Forest-like classifier for vessel size and threat assessment"""
    
    def classify_vessel(self, sar_features: Dict) -> Dict:
        """Estimate vessel size and compute threat score"""
        area = sar_features["area"]
        intensity = sar_features["intensity"]
        elongation = sar_features["elongation"]
        
        # Simple rule-based classifier (simulating Random Forest)
        if area < 150:
            vessel_size = "Small"
            base_threat = 0.3
        elif area < 300:
            vessel_size = "Medium"
            base_threat = 0.6
        else:
            vessel_size = "Large"
            base_threat = 0.9
        
        # Adjust based on intensity (higher backscatter = larger/metallic vessel)
        intensity_factor = (intensity - 100) / 155
        
        # Compute final threat score (0-100)
        threat_score = int(min(100, max(0, (base_threat + intensity_factor * 0.3) * 100)))
        
        return {
            "vessel_size": vessel_size,
            "estimated_length": int(area / 10),  # rough estimate
            "threat_score": threat_score
        }


# Initialize detection components
detector = VesselDetector()
ais_matcher = AISMatcher()
classifier = ThreatClassifier()


async def detection_stream():
    """
    Async generator that yields detection events
    Simulates real-time SAR/AIS fusion pipeline
    """
    detection_id = 1
    
    while True:
        # Wait between detections (simulating satellite pass frequency)
        await asyncio.sleep(random.uniform(3, 8))
        
        # Step 1: SAR Detection (CFAR)
        sar_detection = detector.generate_sar_detection()
        
        # Step 2: AIS Matching
        has_ais = ais_matcher.check_ais_signal(sar_detection)
        
        # Step 3: For dark vessels, classify threat
        if not has_ais:
            classification = classifier.classify_vessel(sar_detection)
            
            detection_event = {
                "vesselId": f"VSL-{datetime.utcnow().strftime('%Y%m%d')}-A{detection_id:03d}",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": sar_detection["latitude"],
                "longitude": sar_detection["longitude"],
                "aisStatus": "OFF",
                "vesselSize": classification["vessel_size"],
                "estimatedLength": classification["estimated_length"],
                "threatScore": classification["threat_score"],
                "sarFeatures": {
                    "area": sar_detection["area"],
                    "intensity": sar_detection["intensity"],
                    "elongation": sar_detection["elongation"]
                }
            }
        else:
            # Cooperative vessel (has AIS)
            detection_event = {
                "vesselId": f"VSL-{datetime.utcnow().strftime('%Y%m%d')}-A{detection_id:03d}",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
                "latitude": sar_detection["latitude"],
                "longitude": sar_detection["longitude"],
                "aisStatus": "ON",
                "threatScore": random.randint(5, 20)  # Low threat
            }
        
        detection_id += 1
        
        # Yield as Server-Sent Event
        yield f"data: {json.dumps(detection_event)}\n\n"


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "Sentinel-Sea API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/api/detections/stream")
async def stream_detections():
    """
    Server-Sent Events endpoint for real-time detection streaming
    """
    return StreamingResponse(
        detection_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.get("/api/mpa")
def get_marine_protected_areas():
    """Get Marine Protected Area boundaries"""
    return {
        "areas": [
            {
                "name": GULF_OF_MANNAR_MPA["name"],
                "coordinates": [
                    [GULF_OF_MANNAR_MPA["bounds"]["lat_min"], GULF_OF_MANNAR_MPA["bounds"]["lon_min"]],
                    [GULF_OF_MANNAR_MPA["bounds"]["lat_max"], GULF_OF_MANNAR_MPA["bounds"]["lon_min"]],
                    [GULF_OF_MANNAR_MPA["bounds"]["lat_max"], GULF_OF_MANNAR_MPA["bounds"]["lon_max"]],
                    [GULF_OF_MANNAR_MPA["bounds"]["lat_min"], GULF_OF_MANNAR_MPA["bounds"]["lon_max"]]
                ]
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
