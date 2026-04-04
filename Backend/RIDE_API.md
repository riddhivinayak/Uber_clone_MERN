# Ride API Documentation

Complete reference for ride management in the Uber Clone backend.

---

## 📋 Table of Contents

1. [Data Model](#data-model)
2. [Service Layer](#service-layer)
3. [Controller Functions](#controller-functions)
4. [Routes & Endpoints](#routes--endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Business Logic](#business-logic)

---

## Data Model

### Ride Schema

**File:** `models/ride.model.js`

```javascript
{
  user: ObjectId,                    // Required, references User model
  captain: ObjectId,                 // Optional, references Captain model (assigned after acceptance)
  pickup: String,                    // Required, pickup location address
  destination: String,               // Required, destination location address
  fare: Number,                      // Required, calculated based on distance, time, vehicle type
  status: String,                    // Enum: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  duration: Number,                  // Ride duration in seconds
  distance: Number,                  // Ride distance in meters
  paymentID: String,                 // Payment gateway ID (Razorpay, Stripe, etc.)
  orderId: String,                   // Payment order ID
  signature: String,                 // Payment signature for verification
  otp: String                        // One-Time Password for ride verification (6 digits, not selected by default)
}
```

**Key Points:**
- `otp` field has `select: false` - not returned in queries unless explicitly selected with `.select('+otp')`
- `status` defaults to `'pending'` when ride is created
- Ride lifecycle: pending → accepted → ongoing → completed OR pending → cancelled

---

## Service Layer

### File: `services/ride.service.js`

#### 1. `getFare(pickup, destination)`

Calculates fare for all vehicle types based on distance and time.

**Parameters:**
- `pickup` (String, required): Pickup location
- `destination` (String, required): Destination location

**Process:**
1. Validates pickup and destination are provided
2. Calls `mapService.getDistanceTime()` to get distance and duration
3. Applies vehicle-specific rates:
   - **Auto:** Base ₹30 + ₹10/km + ₹2/min
   - **Car:** Base ₹50 + ₹15/km + ₹3/min
   - **Moto:** Base ₹20 + ₹8/km + ₹1.5/min
4. Returns object with fare for each vehicle type

**Returns:**
```javascript
{
  auto: Number,   // Calculated fare for auto
  car: Number,    // Calculated fare for car
  moto: Number    // Calculated fare for motorcycle
}
```

**Example:**
```javascript
const fare = await rideService.getFare(
  "Times Square, New York",
  "Central Park, New York"
);
// Returns:
// { auto: 150, car: 225, moto: 120 }
```

---

#### 2. `createRide({ user, pickup, destination, vehicleType })`

Creates a new ride request.

**Parameters:**
- `user` (ObjectId, required): User ID creating the ride
- `pickup` (String, required): Pickup location
- `destination` (String, required): Destination location
- `vehicleType` (String, required): One of 'auto', 'car', 'moto'

**Process:**
1. Validates all required fields
2. Calculates fare using `getFare()`
3. Generates 6-digit OTP using crypto
4. Creates ride document with:
   - Status: pending
   - Fare: vehicle-specific calculated fare
   - OTP: 6-digit random number
5. Returns newly created ride

**Returns:**
```javascript
{
  _id: ObjectId,
  user: ObjectId,
  captain: null,
  pickup: String,
  destination: String,
  fare: Number,
  status: 'pending',
  otp: '123456',
  duration: undefined,
  distance: undefined
}
```

**Throws:**
- Error if any required field is missing

---

#### 3. `confirmRide({ rideId, captain })`

Captain accepts and confirms a ride.

**Parameters:**
- `rideId` (String, required): MongoDB ride ID
- `captain` (Object, required): Captain object with _id

**Process:**
1. Validates rideId is provided
2. Updates ride:
   - Status: 'accepted'
   - Assigns captain._id
3. Retrieves updated ride with populated user and captain details
4. Returns OTP as part of response (selected from database)

**Returns:**
```javascript
{
  _id: ObjectId,
  user: { ...UserObject },        // Populated user details
  captain: { ...CaptainObject },  // Populated captain details
  pickup: String,
  destination: String,
  fare: Number,
  status: 'accepted',
  otp: '123456'
}
```

**Throws:**
- Error if rideId not provided or ride not found

---

#### 4. `startRide({ rideId, otp, captain })`

Captain verifies OTP and starts the ride.

**Parameters:**
- `rideId` (String, required): MongoDB ride ID
- `otp` (String, required): 6-digit OTP from user
- `captain` (Object, required): Captain object for verification

**Process:**
1. Validates rideId and otp
2. Fetches ride and verifies:
   - OTP matches
   - Captain matches assigned captain
   - Status is 'accepted'
3. Updates ride status to 'ongoing'
4. Returns updated ride

**Throws:**
- Error if OTP is incorrect
- Error if captain doesn't match
- Error if ride status is not 'accepted'

---

#### 5. `endRide({ rideId, captain })`

Captain completes the ride.

**Parameters:**
- `rideId` (String, required): MongoDB ride ID
- `captain` (Object, required): Captain object for verification

**Process:**
1. Validates rideId
2. Fetches ride and verifies captain matches
3. Updates ride status to 'completed'
4. Returns completed ride

**Throws:**
- Error if ride not found
- Error if captain doesn't match

---

## Controller Functions

### File: `controllers/ride.controller.js`

#### 1. `createRide(req, res)`

**Route:** `POST /rides/create`

**Purpose:** User creates a new ride request

**Process:**
1. Validates request using `validationResult()`
2. Extracts data from `req.body`: pickup, destination, vehicleType
3. Calls `rideService.createRide()` with user ID from `req.user._id`
4. Sends Socket.io event to nearby captains
5. Returns ride object with 201 status

**Socket.io Event Sent to Captains:**
```javascript
{
  event: 'new-ride',
  data: { rideWithUser } // Full ride object with user details
}
```

**Error Handling:**
- Returns 400 if validation fails
- Returns 500 on service error

---

#### 2. `getFare(req, res)`

**Route:** `GET /rides/get-fare`

**Purpose:** Calculate fare before requesting a ride

**Process:**
1. Validates request using `validationResult()`
2. Extracts query params: pickup, destination
3. Calls `rideService.getFare()`
4. Returns fare object with fares for all vehicle types

**Response:** 200 with fare object
```javascript
{
  auto: 150,
  car: 225,
  moto: 120
}
```

**Error Handling:**
- Returns 400 if validation fails
- Returns 500 on service error

---

#### 3. `confirmRide(req, res)`

**Route:** `POST /rides/confirm`

**Purpose:** Captain accepts a ride

**Process:**
1. Validates request using `validationResult()`
2. Extracts `rideId` from `req.body`
3. Calls `rideService.confirmRide()` with captain from `req.captain`
4. Sends Socket.io event to user
5. Returns confirmed ride object with 200 status

**Socket.io Event Sent to User:**
```javascript
{
  event: 'ride-confirmed',
  data: { ride } // Full ride object with captain details
}
```

**Error Handling:**
- Returns 400 if validation fails
- Returns 500 on service error

---

#### 4. `startRide(req, res)`

**Route:** `GET /rides/start-ride`

**Purpose:** Captain verifies OTP and starts ride

**Process:**
1. Validates request using `validationResult()`
2. Extracts query params: rideId, otp
3. Calls `rideService.startRide()` with captain
4. Sends Socket.io event to user
5. Returns updated ride with 200 status

**Socket.io Event Sent to User:**
```javascript
{
  event: 'ride-started',
  data: { ride } // Full ride object with ongoing status
}
```

**Error Handling:**
- Returns 400 if validation fails
- Returns 500 on service error

---

#### 5. `endRide(req, res)`

**Route:** `POST /rides/end-ride`

**Purpose:** Captain completes the ride

**Process:**
1. Validates request using `validationResult()`
2. Extracts `rideId` from `req.body`
3. Calls `rideService.endRide()` with captain
4. Sends Socket.io event to user
5. Returns completed ride with 200 status

**Socket.io Event Sent to User:**
```javascript
{
  event: 'ride-ended',
  data: { ride } // Full ride object with completed status
}
```

**Error Handling:**
- Returns 400 if validation fails
- Returns 500 on service error

---

## Routes & Endpoints

### File: `routes/ride.routes.js`

| Method | Endpoint | Auth | Query/Body | Purpose |
|--------|----------|------|-----------|---------|
| POST | `/rides/create` | User JWT | body: pickup, destination, vehicleType | Create ride request |
| GET | `/rides/get-fare` | User JWT | query: pickup, destination | Get fare estimate |
| POST | `/rides/confirm` | Captain JWT | body: rideId | Captain accepts ride |
| GET | `/rides/start-ride` | Captain JWT | query: rideId, otp | Captain starts ride |
| POST | `/rides/end-ride` | Captain JWT | body: rideId | Captain completes ride |

---

## Request/Response Examples

### 1. Create Ride

**Request:**
```http
POST /rides/create HTTP/1.1
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "pickup": "123 Main Street, New York, NY",
  "destination": "Times Square, New York, NY",
  "vehicleType": "car"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439012",
  "captain": null,
  "pickup": "123 Main Street, New York, NY",
  "destination": "Times Square, New York, NY",
  "fare": 225,
  "status": "pending",
  "otp": "143589",
  "duration": null,
  "distance": null,
  "paymentID": null,
  "orderId": null,
  "signature": null
}
```

**Validation Error (400):**
```json
{
  "errors": [
    {
      "msg": "Invalid pickup address",
      "param": "pickup",
      "location": "body"
    },
    {
      "msg": "Invalid vehicle type",
      "param": "vehicleType",
      "location": "body"
    }
  ]
}
```

---

### 2. Get Fare

**Request:**
```http
GET /rides/get-fare?pickup=123%20Main%20Street&destination=Times%20Square HTTP/1.1
Authorization: Bearer <user_token>
```

**Success Response (200):**
```json
{
  "auto": 150,
  "car": 225,
  "moto": 120
}
```

**Validation Error (400):**
```json
{
  "errors": [
    {
      "msg": "Invalid pickup address",
      "param": "pickup",
      "location": "query"
    }
  ]
}
```

---

### 3. Confirm Ride

**Request:**
```http
POST /rides/confirm HTTP/1.1
Authorization: Bearer <captain_token>
Content-Type: application/json

{
  "rideId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": "socket123"
  },
  "captain": {
    "_id": "507f1f77bcf86cd799439013",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Smith"
    },
    "email": "jane@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "socketId": "socket456"
  },
  "pickup": "123 Main Street, New York, NY",
  "destination": "Times Square, New York, NY",
  "fare": 225,
  "status": "accepted",
  "otp": "143589"
}
```

**Validation Error (400):**
```json
{
  "errors": [
    {
      "msg": "Invalid ride id",
      "param": "rideId",
      "location": "body"
    }
  ]
}
```

---

### 4. Start Ride

**Request:**
```http
GET /rides/start-ride?rideId=507f1f77bcf86cd799439011&otp=143589 HTTP/1.1
Authorization: Bearer <captain_token>
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": "socket123"
  },
  "captain": {
    "_id": "507f1f77bcf86cd799439013",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Smith"
    }
  },
  "pickup": "123 Main Street, New York, NY",
  "destination": "Times Square, New York, NY",
  "fare": 225,
  "status": "ongoing",
  "duration": null,
  "distance": null
}
```

**Validation Error - Invalid OTP (400):**
```json
{
  "message": "Invalid OTP"
}
```

**Validation Error - Missing Query Param (400):**
```json
{
  "errors": [
    {
      "msg": "Invalid OTP",
      "param": "otp",
      "location": "query"
    }
  ]
}
```

---

### 5. End Ride

**Request:**
```http
POST /rides/end-ride HTTP/1.1
Authorization: Bearer <captain_token>
Content-Type: application/json

{
  "rideId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": "socket123"
  },
  "captain": {
    "_id": "507f1f77bcf86cd799439013",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Smith"
    }
  },
  "pickup": "123 Main Street, New York, NY",
  "destination": "Times Square, New York, NY",
  "fare": 225,
  "status": "completed",
  "duration": 1200,
  "distance": 3500
}
```

---

## Error Handling

### Validation Errors

All endpoints validate input using express-validator. Validation failures return:

**Status Code:** 400

**Response Format:**
```json
{
  "errors": [
    {
      "msg": "Error message",
      "param": "fieldName",
      "location": "body|query"
    }
  ]
}
```

### Common Validation Rules

**Ride Creation:**
- `pickup`: String, min 3 characters
- `destination`: String, min 3 characters
- `vehicleType`: String, must be in ['auto', 'car', 'moto']

**Start Ride:**
- `rideId`: Valid MongoDB ObjectId
- `otp`: String, exactly 6 characters

**Confirm/End Ride:**
- `rideId`: Valid MongoDB ObjectId

### Business Logic Errors

**Status Code:** 500

**Response Format:**
```json
{
  "message": "Error description"
}
```

**Common Errors:**
- "Ride not found"
- "Invalid OTP"
- "Captain doesn't match"
- "Pickup and destination are required"

### Authentication Errors

**Status Code:** 401

**Response Format:**
```json
{
  "message": "Unauthorized"
}
```

---

## Business Logic

### Fare Calculation Algorithm

Fare is calculated using the formula:

```
Fare = BaseFare + (Distance / 1000 * PerKmRate) + (Duration / 60 * PerMinuteRate)
```

**Vehicle Type Rates:**

| Vehicle Type | Base Fare | Per KM | Per Minute |
|--------------|-----------|--------|-----------|
| Auto | ₹30 | ₹10 | ₹2 |
| Car | ₹50 | ₹15 | ₹3 |
| Moto | ₹20 | ₹8 | ₹1.5 |

**Example Calculation:**
```
Distance: 5 km (5000 meters)
Duration: 600 seconds (10 minutes)
Vehicle Type: Car

Fare = 50 + (5000/1000 * 15) + (600/60 * 3)
Fare = 50 + 75 + 30
Fare = ₹155
```

### Ride Lifecycle

```
User Creates Ride (pending)
         ↓
Captain Confirms Ride (accepted)
         ↓
Captain Verifies OTP & Starts Ride (ongoing)
         ↓
Captain Completes Ride (completed)

Alternative:
User/Captain Cancels Ride (cancelled)
```

### OTP Generation

- 6-digit random number generated using Node.js `crypto` module
- Range: 100000 - 999999
- Stored in database but not returned to user by default
- Returned only when ride is confirmed (captain sees it)
- Verified when ride starts

### Real-time Socket Communication

When ride events occur:

1. **Ride Created:** Vector sent to nearby captains (via Maps service)
   - Event: 'new-ride'
   - Contains: Full ride object with user details

2. **Ride Accepted:** Socket message sent to user
   - Event: 'ride-confirmed'
   - Contains: Full ride object with captain details

3. **Ride Started:** Socket message sent to user
   - Event: 'ride-started'
   - Contains: Ride object with status 'ongoing'

4. **Ride Ended:** Socket message sent to user
   - Event: 'ride-ended'
   - Contains: Completed ride object

### Captain Finding Algorithm

After ride creation:
1. Get pickup coordinates using Maps API
2. Query database for captains within 2km radius using geospatial query
3. Send real-time notification to each captain's socket connection
4. First captain to confirm gets the ride

---

## Integration Points

### Dependencies

- **mapService**: Used for distance/time calculation
- **rideModel**: Mongoose model for database operations
- **Socket.io**: Real-time event communication (`sendMessageToSocketId`)
- **express-validator**: Input validation

### Frontend Integration

- User requests a ride via `/rides/create`
- Frontend polls `/rides/get-fare` before requesting
- Captain receives real-time notification via Socket.io 'new-ride' event
- Captain confirms via `/rides/confirm`
- User receives confirmation via 'ride-confirmed' socket event
- Captain starts ride via `/rides/start-ride` with OTP
- User receives start via 'ride-started' socket event
- Captain ends ride via `/rides/end-ride`
- User receives completion via 'ride-ended' socket event

---

**Last Updated:** April 2026
