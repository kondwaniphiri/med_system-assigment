# API Documentation

## Base URL

All API endpoints are prefixed with `/api`

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {} // Optional data payload
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Authentication

### Login

**POST** `/api/login`

**Request Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "admin"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### Logout

**POST** `/api/logout`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Patients

### Fetch All Patients

**POST** `/api/fetch-patients`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "patientId": 1,
      "firstName": "John",
      "surname": "Doe",
      "insuranceName": "Blue Cross",
      "phone": "555-1234",
      "street": "123 Main St",
      "town": "Springfield",
      "province": "IL",
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### Add Patient

**POST** `/api/add-patient`

**Request Body:**

```json
{
  "firstName": "John",
  "surname": "Doe",
  "insurance": "Blue Cross",
  "phone": "555-1234",
  "street": "123 Main St",
  "town": "Springfield",
  "province": "IL"
}
```

**Validation Rules:**

- `firstName`: Required, 2-50 characters, letters/spaces/hyphens/apostrophes only
- `surname`: Required, 2-50 characters, letters/spaces/hyphens/apostrophes only
- `insurance`: Optional, max 100 characters
- `phone`: Optional, valid phone format
- `street`: Optional, max 100 characters
- `town`: Optional, max 50 characters
- `province`: Optional, max 50 characters

**Success Response (201):**

```json
{
  "success": true,
  "message": "Patient added successfully",
  "data": {
    "id": 1
  }
}
```

---

### Update Patient

**POST** `/api/update-patient`

**Request Body:**

```json
{
  "id": 1,
  "firstName": "John",
  "surname": "Doe",
  "insurance": "Blue Cross",
  "phone": "555-1234",
  "street": "123 Main St",
  "town": "Springfield",
  "province": "IL"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Patient updated successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Patient not found"
}
```

---

### Delete Patient

**POST** `/api/delete-patient`

**Request Body:**

```json
{
  "id": 1
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

## Staff

### Fetch All Staff

**POST** `/api/fetch-staff`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "staffId": 1,
      "firstName": "Jane",
      "surname": "Smith",
      "position": "Doctor",
      "SSN": "123-45-6789",
      "street": "456 Oak Ave",
      "town": "Springfield",
      "province": "IL",
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### Add Staff

**POST** `/api/add-staff`

**Request Body:**

```json
{
  "firstname": "Jane",
  "surname": "Smith",
  "position": "Doctor",
  "SSN": "123-45-6789",
  "street": "456 Oak Ave",
  "town": "Springfield",
  "province": "IL"
}
```

**Validation Rules:**

- `firstname`: Required, 2-50 characters, letters/spaces/hyphens/apostrophes only
- `surname`: Required, 2-50 characters, letters/spaces/hyphens/apostrophes only
- `position`: Required, one of: Doctor, Nurse, Administrator, Technician, Receptionist
- `SSN`: Optional, max 20 characters
- `street`: Optional, max 100 characters
- `town`: Optional, max 50 characters
- `province`: Optional, max 50 characters

**Success Response (201):**

```json
{
  "success": true,
  "message": "Staff member added successfully",
  "data": {
    "id": 1
  }
}
```

---

### Update Staff

**POST** `/api/update-staff`

**Request Body:**

```json
{
  "id": 1,
  "firstname": "Jane",
  "surname": "Smith",
  "position": "Doctor",
  "SSN": "123-45-6789",
  "street": "456 Oak Ave",
  "town": "Springfield",
  "province": "IL"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Staff member updated successfully"
}
```

---

### Delete Staff

**POST** `/api/delete-staff`

**Request Body:**

```json
{
  "id": 1
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Staff member deleted successfully"
}
```

---

## Wards

### Fetch All Wards

**POST** `/api/fetch-wards`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "wardId": 1,
      "wardName": "Emergency",
      "capacity": 20,
      "currentOccupancy": 5,
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Relationships

### Add Doctor-Patient Assignment

**POST** `/api/add-doctor-patient`

**Request Body:**

```json
{
  "doctorId": 1,
  "patientId": 2
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Doctor-patient relationship created successfully",
  "data": {
    "id": 1
  }
}
```

---

### Add Nurse-Ward Assignment

**POST** `/api/add-nurse-ward`

**Request Body:**

```json
{
  "nurseId": 1,
  "wardId": 2
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Nurse-ward relationship created successfully",
  "data": {
    "id": 1
  }
}
```

---

### Add Patient-Ward Assignment

**POST** `/api/add-patient-ward`

**Request Body:**

```json
{
  "patientId": 1,
  "wardId": 2
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Patient-ward relationship created successfully",
  "data": {
    "id": 1
  }
}
```

---

## Appointments

### Get Patient Appointments

**POST** `/api/appointments-patient`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "patientId": 1,
      "firstName": "John",
      "surname": "Doe",
      "wardName": "Emergency",
      "position": "Doctor",
      "staffName": "Jane",
      "staffId": 1
    }
  ]
}
```

---

### Get Doctor Appointments

**POST** `/api/appointments-doctor`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "doctorId": 1,
      "position": "Doctor",
      "doctorName": "Jane",
      "patientId": 1,
      "firstName": "John",
      "surname": "Doe"
    }
  ]
}
```

---

### Get Nurse Appointments

**POST** `/api/appointments-nurse`

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "nurseId": 2,
      "nurseName": "Sarah",
      "patientId": 1,
      "surname": "Doe",
      "firstName": "John",
      "wardName": "Emergency",
      "wardId": 1
    }
  ]
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "First name is required",
      "param": "firstName",
      "location": "body"
    }
  ]
}
```

### Duplicate Entry (409)

```json
{
  "success": false,
  "message": "Duplicate entry. Record already exists."
}
```

### Foreign Key Constraint (400)

```json
{
  "success": false,
  "message": "Referenced record does not exist."
}
```

### Delete Constraint (400)

```json
{
  "success": false,
  "message": "Cannot delete. Record is referenced by other records."
}
```
