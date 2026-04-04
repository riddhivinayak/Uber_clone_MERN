# Map API Documentation

Complete reference for location, distance, and geolocation services in the Uber Clone backend.

---

## 📋 Table of Contents

1. [Service Layer](#service-layer)
2. [Controller Functions](#controller-functions)
3. [Routes & Endpoints](#routes--endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [External API Integration](#external-api-integration)
6. [Error Handling](#error-handling)
7. [Geospatial Queries](#geospatial-queries)

---

## Service Layer

### File: `services/maps.service.js`

The Maps service integrates Google Maps APIs to provide location and geospatial functionality. It also queries MongoDB for nearby captains using geospatial indexing.

---

#### 1. `getAddressCoordinate(address)`

Converts a human-readable address to latitude and longitude coordinates using Google Geocoding API.

**Parameters:**
- `address` (String, required): Full address or location name

**Process:**
1. Validates address is provided
2. Makes request to Google Maps Geocoding API
3. Extracts latitude and longitude from response
4. Returns coordinate object

**Returns:**
```javascript
{
  ltd: Number,    // Latitude
  lng: Number     // Longitude
}
```

**Example:**
```javascript
const coordinates = await mapService.getAddressCoordinate("Times Square, New York");
// Returns:
// { ltd: 40.758896, lng: -73.985130 }
```

**External API Call:**
```
GET https://maps.googleapis.com/maps/api/geocode/json
  ?address=Times%20Square,%20New%20York
  &key=YOUR_API_KEY
```

**API Response Status:**
- `OK`: Successfully returned one or more addresses
- `ZERO_RESULTS`: No results found
- `OVER_QUERY_LIMIT`: API key exceeded quota
- `REQUEST_DENIED`: Request was denied
- `INVALID_REQUEST`: Invalid request

**Throws:**
- Error if address is not provided
- Error if Google API returns non-OK status
- Error on network failure

---

#### 2. `getDistanceTime(origin, destination)`

Calculates distance and estimated travel time between two addresses using Google Distance Matrix API.

**Parameters:**
- `origin` (String, required): Starting address
- `destination` (String, required): Ending address

**Process:**
1. Validates both origin and destination are provided
2. Makes request to Google Distance Matrix API
3. Handles "ZERO_RESULTS" case when no route exists
4. Returns distance (in meters) and duration (in seconds)

**Returns:**
```javascript
{
  distance: {
    text: String,           // Formatted distance (e.g., "2.5 km")
    value: Number           // Distance in meters
  },
  duration: {
    text: String,           // Formatted duration (e.g., "10 mins")
    value: Number           // Duration in seconds
  },
  status: String            // "OK" or error status
}
```

**Example:**
```javascript
const info = await mapService.getDistanceTime(
  "123 Main St, NYC",
  "Times Square, NYC"
);
// Returns:
// {
//   distance: { text: "2.5 km", value: 2500 },
//   duration: { text: "10 mins", value: 600 },
//   status: "OK"
// }
```

**External API Call:**
```
GET https://maps.googleapis.com/maps/api/distancematrix/json
  ?origins=123%20Main%20St,%20NYC
  &destinations=Times%20Square,%20NYC
  &key=YOUR_API_KEY
```

**Throws:**
- Error if origin or destination not provided
- Error if route not found (ZERO_RESULTS)
- Error if Google API returns non-OK status
- Error on network failure

---

#### 3. `getAutoCompleteSuggestions(input)`

Returns address autocomplete suggestions based on partial input using Google Places Autocomplete API.

**Parameters:**
- `input` (String, required): Partial address or location name (min 3 characters)

**Process:**
1. Validates input is provided
2. Makes request to Google Places Autocomplete API
3. Extracts unique descriptions from predictions
4. Filters out empty predictions
5. Returns array of suggestion strings

**Returns:**
```javascript
[
  "Times Square, New York, NY, USA",
  "Times Square Park, New York, NY, USA",
  "Times Square NYC Photo Booth, New York, NY, USA",
  // ... more suggestions
]
```

**Example:**
```javascript
const suggestions = await mapService.getAutoCompleteSuggestions("times sq");
// Returns:
// [
//   "Times Square, New York, NY, USA",
//   "Times Square Park, New York, NY, USA",
//   "Times Square Officetel, Seoul, South Korea"
// ]
```

**External API Call:**
```
GET https://maps.googleapis.com/maps/api/place/autocomplete/json
  ?input=times%20sq
  &key=YOUR_API_KEY
```

**API Response Format:**
```json
{
  "status": "OK",
  "predictions": [
    {
      "description": "Times Square, New York, NY, USA",
      "place_id": "ChIJ76...",
      ...
    }
  ]
}
```

**Throws:**
- Error if input not provided
- Error if Google API returns non-OK status
- Error on network failure

---

#### 4. `getCaptainsInTheRadius(ltd, lng, radius)`

Finds all active captains within a specified radius of a given coordinate using MongoDB geospatial query.

**Parameters:**
- `ltd` (Number, required): Latitude of center point
- `lng` (Number, required): Longitude of center point
- `radius` (Number, required): Radius in kilometers

**Process:**
1. Queries MongoDB Captain collection
2. Uses `$geoWithin` operator with `$centerSphere` to find captains
3. Converts radius from km to radians (Earth radius = 6371 km)
4. Returns array of captains with their details

**Database Query:**
```javascript
captainModel.find({
  location: {
    $geoWithin: {
      $centerSphere: [[lat, lng], radius / 6371]
    }
  }
})
```

**Returns:**
```javascript
[
  {
    _id: ObjectId,
    fullname: { firstname: "John", lastname: "Smith" },
    email: "john@example.com",
    status: "active",
    vehicle: { color: "Blue", plate: "ABC123", ... },
    socketId: "socket123",
    location: { lat: 40.758896, lng: -73.985130 }
  },
  // ... more captains
]
```

**Example:**
```javascript
// Find captains within 2km of pickup location
const captains = await mapService.getCaptainsInTheRadius(
  40.758896,  // latitude
  -73.985130, // longitude
  2           // 2km radius
);
// Returns array of captain objects
```

**Geospatial Query Details:**
- `$centerSphere` expects: [[longitude, lng], radius_in_radians]
- Radius conversion: `radius_km / 6371` (Earth's radius in km)
- Captains must have location data stored as [lat, lng]

**Prerequisites:**
- MongoDB must have geospatial index on `captain.location`
- Captain schema location must be stored as coordinates

**Throws:**
- No error if no captains found (returns empty array)
- Error if coordinates invalid

---

## Controller Functions

### File: `controllers/map.controller.js`

#### 1. `getCoordinates(req, res, next)`

**Route:** `GET /maps/get-coordinates`

**Purpose:** Convert address to latitude/longitude coordinates

**Process:**
1. Validates request using `validationResult()`
2. Extracts `address` from query parameters
3. Calls `mapService.getAddressCoordinate()`
4. Returns coordinates with 200 status

**Response:**
```javascript
{
  ltd: Number,    // Latitude
  lng: Number     // Longitude
}
```

**Error Handling:**
- Returns 400 if validation fails (address too short)
- Returns 404 if coordinates not found
- Returns 500 on unexpected error

---

#### 2. `getDistanceTime(req, res, next)`

**Route:** `GET /maps/get-distance-time`

**Purpose:** Get distance and travel time between two locations

**Process:**
1. Validates request using `validationResult()`
2. Extracts `origin` and `destination` query parameters
3. Calls `mapService.getDistanceTime()`
4. Returns distance/duration object with 200 status

**Response:**
```javascript
{
  distance: {
    text: "2.5 km",
    value: 2500
  },
  duration: {
    text: "10 mins",
    value: 600
  }
}
```

**Error Handling:**
- Returns 400 if validation fails
- Returns 500 on service error or no route found

---

#### 3. `getAutoCompleteSuggestions(req, res, next)`

**Route:** `GET /maps/get-suggestions`

**Purpose:** Get address autocomplete suggestions

**Process:**
1. Validates request using `validationResult()`
2. Extracts `input` query parameter
3. Calls `mapService.getAutoCompleteSuggestions()`
4. Returns array of suggestions with 200 status

**Response:**
```javascript
[
  "Times Square, New York, NY, USA",
  "Times Square Park, New York, NY, USA",
  "Times Square NYC Photo Booth, New York, NY, USA"
]
```

**Error Handling:**
- Returns 400 if validation fails (input too short)
- Returns 500 on service error

---

## Routes & Endpoints

### File: `routes/map.routes.js`

| Method | Endpoint | Auth | Query Params | Purpose |
|--------|----------|------|--------------|---------|
| GET | `/maps/get-coordinates` | User JWT | address (min 3 chars) | Get coords from address |
| GET | `/maps/get-distance-time` | User JWT | origin, destination (min 3 chars each) | Get distance/time |
| GET | `/maps/get-suggestions` | User JWT | input (min 3 chars) | Get address suggestions |

**All endpoints require:**
- User JWT token in Authorization header or cookie
- Valid query parameters with minimum length validation

---

## Request/Response Examples

### 1. Get Coordinates

**Request:**
```http
GET /maps/get-coordinates?address=Times%20Square,%20New%20York HTTP/1.1
Authorization: Bearer <user_token>
```

**Success Response (200):**
```json
{
  "ltd": 40.758896,
  "lng": -73.985130
}
```

**Validation Error - Too Short (400):**
```json
{
  "errors": [
    {
      "msg": "Please provide a valid address",
      "param": "address",
      "location": "query"
    }
  ]
}
```

**Not Found Error (404):**
```json
{
  "message": "Coordinates not found"
}
```

---

### 2. Get Distance & Time

**Request:**
```http
GET /maps/get-distance-time?origin=123%20Main%20St&destination=Times%20Square HTTP/1.1
Authorization: Bearer <user_token>
```

**Success Response (200):**
```json
{
  "distance": {
    "text": "2.5 km",
    "value": 2500
  },
  "duration": {
    "text": "10 mins",
    "value": 600
  },
  "status": "OK"
}
```

**Validation Error - Missing Parameter (400):**
```json
{
  "errors": [
    {
      "msg": "Please provide a valid destination",
      "param": "destination",
      "location": "query"
    }
  ]
}
```

**No Route Found (500):**
```json
{
  "message": "No routes found"
}
```

---

### 3. Get Autocomplete Suggestions

**Request:**
```http
GET /maps/get-suggestions?input=times HTTP/1.1
Authorization: Bearer <user_token>
```

**Success Response (200):**
```json
[
  "Times Square, New York, NY, USA",
  "Times Square Park, New York, NY, USA",
  "Times Square NYC Photo Booth, New York, NY, USA",
  "Times Square Officetel, Seoul, South Korea",
  "Times Square Service Station, Mumbai, India"
]
```

**Validation Error - Input Too Short (400):**
```json
{
  "errors": [
    {
      "msg": "Please provide a valid input",
      "param": "input",
      "location": "query"
    }
  ]
}
```

**No Suggestions (200):**
```json
[]
```

---

## External API Integration

### Google Maps API Setup

**Required APIs:**
1. Google Geocoding API
2. Google Distance Matrix API
3. Google Places API (Autocomplete)

**Environment Variables:**
```env
GOOGLE_MAPS_API_KEY=your_geocoding_api_key
GOOGLE_MAPS_API=your_distance_matrix_and_places_api_key
```

**Note:** Different API keys may be used for different services depending on quota management.

### API Rate Limits

- **Geocoding API:** Typically 50 QPS (queries per second)
- **Distance Matrix API:** Typically 100 elements per second
- **Places Autocomplete:** Typically 1,000 requests per 24 hours

### API Cost Considerations

**Per Request Billing:**
- Geocoding: $0.005 per request
- Distance Matrix: $0.005 per request (element)
- Places Autocomplete: $0.017 per session

**Optimization Tips:**
- Cache frequently requested coordinates
- Batch distance requests when possible
- Implement rate limiting on frontend

### Error Handling from Google APIs

| Status | Meaning | Action |
|--------|---------|--------|
| OK | Request successful | Return data |
| ZERO_RESULTS | No results found | Return appropriate error |
| OVER_QUERY_LIMIT | Quota exceeded | Retry or queue request |
| REQUEST_DENIED | Request denied | Check API key/permissions |
| INVALID_REQUEST | Invalid parameters | Fix request parameters |
| UNKNOWN_ERROR | Server error | Retry request |

---

## Error Handling

### Validation Errors

**Status Code:** 400

**Response Format:**
```json
{
  "errors": [
    {
      "msg": "Error message",
      "param": "paramName",
      "location": "query"
    }
  ]
}
```

**Validation Rules:**
- `address`: String, min 3 characters
- `origin`: String, min 3 characters
- `destination`: String, min 3 characters
- `input`: String, min 3 characters

### API Integration Errors

**Status Code:** 500

**Response Format:**
```json
{
  "message": "Error description"
}
```

**Common Errors:**
- "Unable to fetch coordinates"
- "Unable to fetch distance and time"
- "No routes found"
- "Unable to fetch suggestions"

### Not Found Errors

**Status Code:** 404

**Response Format:**
```json
{
  "message": "Coordinates not found"
}
```

### Authentication Errors

**Status Code:** 401

**Response Format:**
```json
{
  "message": "Unauthorized"
}
```

---

## Geospatial Queries

### MongoDB Geospatial Indexing

**Captain Model Location:**
```javascript
location: {
  lat: { type: Number },
  lng: { type: Number }
}
```

**Required Geospatial Index:**
```javascript
// In captainModel or migration:
captainSchema.index({ location: "2dsphere" });
```

### $centerSphere Query

Finds all documents within a sphere (circle on Earth surface).

**Formula:**
```
Query: { location: { $geoWithin: { $centerSphere: [[lng, lat], radius_in_radians] } } }
radius_in_radians = radius_in_km / 6371
```

**Why `[lng, lat]` order?**
- GeoJSON coordinates always use [longitude, latitude]
- This is different from typical [lat, lng] convention

**Example:**
```javascript
// Find captains within 2km
const captains = await captainModel.find({
  location: {
    $geoWithin: {
      $centerSphere: [[-73.985130, 40.758896], 2 / 6371]
    }
  }
});
```

### Performance Optimization

- Always ensure geospatial index exists
- Limit radius searches to reasonable distances (2-10km)
- Filter by status='active' in same query
- Consider caching captain locations every 5 minutes

---

## Integration Points

### With Ride Service

When a ride is created:
1. `mapService.getAddressCoordinate()` converts pickup address to coordinates
2. `mapService.getCaptainsInTheRadius()` finds nearby captains
3. Captains are notified via Socket.io with ride details

**Code Example:**
```javascript
// In ride.controller.js
const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
const captainsInRadius = await mapService.getCaptainsInTheRadius(
  pickupCoordinates.ltd,
  pickupCoordinates.lng,
  2  // 2km radius
);
```

### With Fare Calculation

When calculating fare for a ride:
1. `mapService.getDistanceTime()` gets distance and duration
2. Ride service uses distance/time values for fare calculation

**Code Example:**
```javascript
// In ride.service.js
const distanceTime = await mapService.getDistanceTime(pickup, destination);
const distance = distanceTime.distance.value;  // meters
const duration = distanceTime.duration.value;  // seconds
```

### Frontend Integration

**Location Search:**
1. User types in location field
2. Frontend calls `/maps/get-suggestions?input=...`
3. Shows dropdown of suggestions
4. User selects suggestion

**Fare Estimation:**
1. User selects pickup and destination
2. Frontend calls `/maps/get-distance-time?origin=...&destination=...`
3. Shows estimated distance
4. Calls `/rides/get-fare?pickup=...&destination=...`
5. Shows estimated fares

**Real-time Captain Location:**
1. Captain updates location periodically
2. Backend updates captain document with new coordinates
3. When new ride created, system queries captains near pickup

---

## Best Practices

1. **Caching:** Cache coordinate queries for frequently used addresses
2. **Rate Limiting:** Implement client-side throttling for autocomplete
3. **Error Recovery:** Retry failed API calls with exponential backoff
4. **Monitoring:** Log all external API calls for debugging
5. **Geospatial Index:** Always create 2dsphere index for location queries
6. **Radius Selection:** Use appropriate radius (2-5km) to balance results
7. **Validation:** Always validate API responses before using data
8. **Cost:** Monitor Google Maps API usage and set up billing alerts

---

**Last Updated:** April 2026
