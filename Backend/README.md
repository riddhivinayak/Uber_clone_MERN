# Uber Clone Backend API Documentation

This document describes the RESTful API used by the Uber Clone backend service. It includes the available endpoints for **users** and **captains**, request/response formats, validation rules, and authentication requirements.

---

## 📌 Common Concepts

### Base URL
All endpoints are relative to the backend server root. Example:

```
http://localhost:5000/
```

> The exact host and port depend on how you run the server (e.g., `npm start` vs `nodemon`).

### Authentication
Most protected endpoints require a **JWT access token**.

1. Add the token in the request header:

```
Authorization: Bearer <token>
```

2. Or send it as a cookie named `token`.

### Error Response Format
On validation errors, the API returns an array of error objects:

```json
{
  "errors": [
    {
      "msg": "Description of the error",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

For authentication/authorization failures, the response is typically:

```json
{
  "message": "Unauthorized"
}
```

---

## 👤 User Routes

### 1) Register User

**Endpoint:** `POST /register`

**Description:** Create a new user account.

**Request Body (JSON):**

```json
{
  "fullName": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "jane.doe@example.com",
  "password": "SuperSecret123"
}
```

**Validation Rules:**
- `fullName.firstname` minimum 3 characters
- `fullName.lastname` minimum 2 characters
- `email` must be a valid email address
- `password` minimum 6 characters

**Responses:**

- **201 Created**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "_id": "<user_id>",
      "fullName": {
        "firstname": "Jane",
        "lastname": "Doe"
      },
      "email": "jane.doe@example.com"
    },
    "token": "<jwt_token>"
  }
  ```

- **400 Bad Request** (validation errors)

---

### 2) Login User

**Endpoint:** `POST /login`

**Description:** Authenticate an existing user and return a JWT token.

**Request Body (JSON):**

```json
{
  "email": "jane.doe@example.com",
  "password": "SuperSecret123"
}
```

**Responses:**

- **200 OK**
  ```json
  {
    "message": "Login successful",
    "user": {
      "_id": "<user_id>",
      "fullName": {
        "firstname": "Jane",
        "lastname": "Doe"
      },
      "email": "jane.doe@example.com"
    },
    "token": "<jwt_token>"
  }
  ```

- **400 Bad Request** (validation errors)
- **401 Unauthorized** (invalid credentials)

---

### 3) Get User Profile

**Endpoint:** `GET /profile`

**Description:** Fetch the authenticated user’s profile.

**Authentication:** Required

**Responses:**

- **200 OK**
  ```json
  {
    "_id": "<user_id>",
    "fullName": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane.doe@example.com"
  }
  ```

- **401 Unauthorized** (missing/invalid token)

---

### 4) Logout User

**Endpoint:** `GET /logout`

**Description:** Invalidate the current user session by blacklisting the JWT token and clearing the cookie.

**Authentication:** Required

**Responses:**

- **200 OK**
  ```json
  {
    "message": "Logout successful"
  }
  ```

- **401 Unauthorized** (missing/invalid token)

---

## 🚖 Captain Routes

All captain-related endpoints are prefixed with `/captains`.

### 1) Register Captain

**Endpoint:** `POST /captains/register`

**Description:** Create a new captain account (driver) with vehicle details.

**Request Body (JSON):**

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Smith"
  },
  "email": "john.smith@example.com",
  "password": "Str0ngP@ssword",
  "vehicle": {
    "color": "Blue",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

**Validation Rules:**
- `fullname.firstname` minimum 3 characters
- `fullname.lastname` minimum 3 characters
- `email` must be a valid email address
- `password` minimum 6 characters
- `vehicle.color` minimum 3 characters
- `vehicle.plate` minimum 3 characters
- `vehicle.capacity` must be an integer ≥ 1
- `vehicle.vehicleType` must be one of: `car`, `motorcycle`, `auto`

**Responses:**

- **201 Created**
  ```json
  {
    "token": "<jwt_token>",
    "captain": {
      "_id": "<captain_id>",
      "fullname": {
        "firstname": "John",
        "lastname": "Smith"
      },
      "email": "john.smith@example.com",
      "vehicle": {
        "color": "Blue",
        "plate": "ABC123",
        "capacity": 4,
        "vehicleType": "car"
      },
      "status": "inactive",
      "socketId": null,
      "location": {
        "lat": null,
        "lng": null
      }
    }
  }
  ```

- **400 Bad Request** (validation errors / captain already exists)

---

### 2) Login Captain

**Endpoint:** `POST /captains/login`

**Description:** Authenticate an existing captain and return a JWT token.

**Request Body (JSON):**

```json
{
  "email": "john.smith@example.com",
  "password": "Str0ngP@ssword"
}
```

**Responses:**

- **200 OK**
  ```json
  {
    "message": "Login successful",
    "captain": {
      "_id": "<captain_id>",
      "fullname": {
        "firstname": "John",
        "lastname": "Smith"
      },
      "email": "john.smith@example.com",
      "vehicle": {
        "color": "Blue",
        "plate": "ABC123",
        "capacity": 4,
        "vehicleType": "car"
      }
    },
    "token": "<jwt_token>"
  }
  ```

- **400 Bad Request** (validation errors)
- **401 Unauthorized** (invalid credentials)

---

### 3) Get Captain Profile

**Endpoint:** `GET /captains/profile`

**Description:** Fetch the authenticated captain’s profile.

**Authentication:** Required

**Responses:**

- **200 OK**
  ```json
  {
    "_id": "<captain_id>",
    "fullname": {
      "firstname": "John",
      "lastname": "Smith"
    },
    "email": "john.smith@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "status": "inactive",
    "socketId": null,
    "location": {
      "lat": null,
      "lng": null
    }
  }
  ```

- **401 Unauthorized** (missing/invalid token)

---

### 4) Logout Captain

**Endpoint:** `GET /captains/logout`

**Description:** Invalidate the current captain session by blacklisting the JWT token and clearing the cookie.

**Authentication:** Required

**Responses:**

- **200 OK**
  ```json
  {
    "message": "Logout successful"
  }
  ```

- **401 Unauthorized** (missing/invalid token)

---

## 🚀 Running the Backend

From the `Backend` folder:

```bash
npm install
npm start
```

> The server listens on the port configured in `app.js` / environment variables.


## Captain API Endpoints

## Captain Registration Endpoint

## Endpoint

POST /captains/register

## Description

This endpoint allows captains to register a new account by providing their full name, email, password, and vehicle details.

## Required Data

The request body must be in JSON format and include the following fields:

- `fullname`: An object containing:
  - `firstname`: String, at least 3 characters
  - `lastname`: String, at least 3 characters
- `email`: String, valid email address
- `password`: String, at least 6 characters
- `vehicle`: An object containing:
  - `color`: String, at least 3 characters
  - `plate`: String, at least 3 characters
  - `capacity`: Integer, at least 1
  - `vehicleType`: String, must be one of: 'car', 'motorcycle', 'auto'

## Status Codes

- 201: Captain registered successfully
- 400: Validation errors (e.g., invalid email, short password, missing fields, etc.)

## Example Responses

### Success (201)

```json
{
  "token": "jwt_token_here",
  "captain": {
    "_id": "captain_id",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "status": "inactive",
    "socketId": null,
    "location": {
      "lat": null,
      "lng": null
    }
  }
}
```

### Validation Error (400)

```json
{
  "errors": [
    {
      "msg": "Please enter a valid email address",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

### Captain Already Exists (400)

```json
{
  "message": "Captain with this email already exists"
}
```
