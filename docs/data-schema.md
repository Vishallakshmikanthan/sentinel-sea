# Vessel Detection Data Schema

## Overview

This document describes the data schema for maritime vessel detection records in the Sentinel-Sea system. The schema supports real-time streaming updates and historical querying for maritime surveillance operations.

## Schema Location

- **JSON Schema**: [`backend/schemas/vessel_detection.schema.json`](file:///c:/Users/visha/Downloads/Antigravity/sentinel-sea/backend/schemas/vessel_detection.schema.json)
- **Format**: JSON Schema Draft-07
- **Validation**: Use for API request/response validation and database constraints

## Core Fields

### Identification & Timing

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detection_id` | string | ✓ | Unique ID (format: `VSL-YYYYMMDD-A###`) |
| `timestamp` | datetime | ✓ | ISO 8601 detection timestamp |
| `created_at` | datetime | - | Database record creation time |
| `updated_at` | datetime | - | Last update timestamp |

### Geolocation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | number | ✓ | Decimal degrees (-90 to 90) |
| `longitude` | number | ✓ | Decimal degrees (-180 to 180) |
| `inside_protected_area` | boolean | ✓ | Whether vessel is inside MPA |
| `protected_area_name` | string | - | MPA name if applicable |
| `distance_to_boundary_meters` | number | - | Distance to MPA boundary (−/+) |

### SAR Features

The `sar_features` object contains radar-derived characteristics:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `area` | number | ✓ | Target area (m²) |
| `mean_intensity` | number | ✓ | Mean backscatter (dB) |
| `elongation_ratio` | number | ✓ | Length/width ratio |
| `max_intensity` | number | - | Peak backscatter (dB) |
| `std_intensity` | number | - | Intensity std deviation |
| `perimeter` | number | - | Target perimeter (m) |
| `confidence_score` | number | - | CFAR confidence (0-1) |

### Vessel Characteristics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `estimated_vessel_size_category` | enum | ✓ | `small`, `medium`, `large`, `very_large` |
| `estimated_length_meters` | number | - | Estimated length in meters |

### AIS Correlation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ais_status` | boolean | ✓ | `true` = AIS ON, `false` = AIS OFF |
| `ais_match_details` | object | - | Details if AIS match found |
| `ais_match_details.mmsi` | string | - | 9-digit MMSI number |
| `ais_match_details.vessel_name` | string | - | Vessel name from AIS |
| `ais_match_details.vessel_type` | string | - | Vessel type classification |
| `ais_match_details.distance_meters` | number | - | SAR-AIS distance (m) |
| `ais_match_details.time_delta_seconds` | number | - | Time difference (seconds) |

### Threat Assessment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `threat_score` | integer | ✓ | Computed score (0-100) |
| `threat_factors` | array | - | Contributing factors (see below) |

**Threat Factors Enum:**
- `no_ais_broadcast`
- `inside_protected_area`
- `large_vessel_profile`
- `high_intensity_signature`
- `night_time_operation`
- `proximity_to_boundary`

### Analyst Review

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `analyst_review_status` | enum | ✓ | `pending`, `confirmed`, `dismissed` |
| `review_timestamp` | datetime | - | Time of review (null if pending) |
| `analyst_id` | string | - | Reviewer identifier |
| `analyst_notes` | string | - | Freeform notes (max 1000 chars) |

### Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detection_source` | string | ✓ | Always `"Sentinel-1 SAR"` |
| `sentinel_metadata` | object | - | Satellite acquisition metadata |
| `sentinel_metadata.product_id` | string | - | Sentinel-1 product ID |
| `sentinel_metadata.orbit_number` | integer | - | Orbit number |
| `sentinel_metadata.polarization` | enum | - | `VV`, `VH`, `HH`, `HV` |
| `sentinel_metadata.incidence_angle` | number | - | Radar angle (0-90°) |

## Example Records

### Anomalous Vessel (AIS OFF)

```json
{
  "detection_id": "VSL-20240129-A001",
  "timestamp": "2024-01-29T14:30:00Z",
  "latitude": 12.4567,
  "longitude": 78.9012,
  "sar_features": {
    "area": 320.5,
    "mean_intensity": -12.5,
    "elongation_ratio": 3.2,
    "confidence_score": 0.89
  },
  "estimated_vessel_size_category": "large",
  "estimated_length_meters": 45,
  "ais_status": false,
  "threat_score": 87,
  "threat_factors": [
    "no_ais_broadcast",
    "inside_protected_area",
    "large_vessel_profile"
  ],
  "analyst_review_status": "pending",
  "detection_source": "Sentinel-1 SAR",
  "inside_protected_area": true,
  "protected_area_name": "Gulf of Mannar Marine National Park"
}
```

### Cooperative Vessel (AIS ON)

```json
{
  "detection_id": "VSL-20240129-A002",
  "timestamp": "2024-01-29T14:25:00Z",
  "latitude": 12.4890,
  "longitude": 78.8765,
  "sar_features": {
    "area": 180.2,
    "mean_intensity": -14.2,
    "elongation_ratio": 2.8
  },
  "estimated_vessel_size_category": "medium",
  "ais_status": true,
  "ais_match_details": {
    "mmsi": "123456789",
    "vessel_name": "COASTAL TRADER",
    "vessel_type": "Cargo",
    "distance_meters": 125.3
  },
  "threat_score": 23,
  "analyst_review_status": "confirmed",
  "detection_source": "Sentinel-1 SAR",
  "inside_protected_area": false
}
```

## Database Implementation

### Indexing Strategy

For optimal real-time and historical querying:

```sql
-- Primary key
CREATE INDEX idx_detection_id ON vessel_detections(detection_id);

-- Time-series queries
CREATE INDEX idx_timestamp ON vessel_detections(timestamp DESC);

-- Spatial queries
CREATE INDEX idx_geolocation ON vessel_detections USING GIST(
  ST_MakePoint(longitude, latitude)
);

-- Filtering by status
CREATE INDEX idx_review_status ON vessel_detections(analyst_review_status);
CREATE INDEX idx_ais_status ON vessel_detections(ais_status);

-- Threat-based queries
CREATE INDEX idx_threat_score ON vessel_detections(threat_score DESC);

-- MPA filtering
CREATE INDEX idx_protected_area ON vessel_detections(inside_protected_area, protected_area_name);

-- Composite for dashboard queries
CREATE INDEX idx_dashboard ON vessel_detections(
  timestamp DESC, analyst_review_status, threat_score DESC
);
```

### Time-Series Partitioning

For large-scale historical data:

```sql
-- Partition by month for efficient archival
CREATE TABLE vessel_detections_2024_01 PARTITION OF vessel_detections
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## API Endpoints

### Real-Time Stream

```
GET /api/v1/detections/stream
WebSocket: wss://api.sentinel-sea.org/v1/detections/stream
```

Returns new detections as they are processed.

### Historical Query

```
GET /api/v1/detections?
  start_date=2024-01-01T00:00:00Z&
  end_date=2024-01-31T23:59:59Z&
  ais_status=false&
  min_threat_score=70&
  inside_protected_area=true&
  review_status=pending
```

Supports filtering, pagination, and sorting.

## Validation

Use the JSON Schema for validation:

**Python (FastAPI):**
```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, Literal

class SARFeatures(BaseModel):
    area: float = Field(ge=0)
    mean_intensity: float
    elongation_ratio: float = Field(ge=1)
    confidence_score: Optional[float] = Field(None, ge=0, le=1)

class VesselDetection(BaseModel):
    detection_id: str = Field(pattern=r"^VSL-[0-9]{8}-[A-Z][0-9]{3}$")
    timestamp: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    sar_features: SARFeatures
    estimated_vessel_size_category: Literal["small", "medium", "large", "very_large"]
    ais_status: bool
    threat_score: int = Field(ge=0, le=100)
    analyst_review_status: Literal["pending", "confirmed", "dismissed"]
    detection_source: Literal["Sentinel-1 SAR"]
    inside_protected_area: bool
```

**JavaScript (Node.js):**
```javascript
const Ajv = require('ajv');
const schema = require('./schemas/vessel_detection.schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

function validateDetection(data) {
  const valid = validate(data);
  if (!valid) {
    throw new Error(JSON.stringify(validate.errors));
  }
  return true;
}
```

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-29 | Initial schema definition |
