# User API Endpoints

## User Registration Endpoint

## Endpoint

POST /register

## Description

This endpoint allows users to register a new account by providing their full name, email, and password.

## Required Data

The request body must be in JSON format and include the following fields:

- `fullName`: An object containing:
  - `firstname`: String, at least 3 characters
  - `lastname`: String, at least 2 characters
- `email`: String, valid email address
- `password`: String, at least 6 characters

## Status Codes

- 201: User registered successfully
- 400: Validation errors (e.g., invalid email, short password, etc.)

## Example Responses

### Success (201)

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "fullName": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  },
  "token": "jwt_token_here"
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
    }
  ]
}
```

## User Login Endpoint

## Endpoint

POST /login

## Description

This endpoint allows users to log in by providing their email and password.

## Required Data

The request body must be in JSON format and include the following fields:

- `email`: String, valid email address
- `password`: String, required

## Status Codes

- 200: Login successful
- 400: Validation errors (e.g., invalid email, missing password)
- 401: Invalid email or password

## Example Responses

### Success (200)

```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "fullName": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  },
  "token": "jwt_token_here"
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
    }
  ]
}
```

### Invalid Credentials (401)

```json
{
  "message": "Invalid email or password"
}
```

## User Profile Endpoint

## Endpoint

GET /profile

## Description

This endpoint retrieves the profile information of the authenticated user.

## Authentication

Required. Include the JWT token in the Authorization header (Bearer token) or as a cookie named 'token'.

## Status Codes

- 200: Profile retrieved successfully
- 401: Unauthorized (invalid or missing token)

## Example Responses

### Success (200)

```json
{
  "_id": "user_id",
  "fullName": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com"
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthorized"
}
```

## User Logout Endpoint

## Endpoint

GET /logout

## Description

This endpoint logs out the authenticated user by clearing the token cookie and blacklisting the JWT token to prevent further use.

## Authentication

Required. Include the JWT token in the Authorization header (Bearer token) or as a cookie named 'token'.

## Status Codes

- 200: Logout successful
- 401: Unauthorized (invalid or missing token)

## Example Responses

### Success (200)

```json
{
  "message": "Logout successful"
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthorized"
}
```

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
