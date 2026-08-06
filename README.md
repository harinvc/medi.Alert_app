# medi.Alert_app
kavin-backend , 
harin-app build , 
ajay-frontend


# 🚑 AI-Powered Centralized Medical Emergency Response Alert System

An AI-powered hybrid mobile application designed to reduce emergency response time by intelligently connecting patients, ambulances, and hospitals. The system leverages **Gemini AI**, **Google Maps API**, and **PHP/MySQL** to provide real-time emergency triage, hospital matching, and live tracking.

---

# 📌 Problem Statement

During medical emergencies, every minute matters. Victims often experience delays because:

- Bystanders cannot clearly explain the emergency.
- The nearest hospital may not have the required specialty.
- Hospitals are unaware of incoming patients.
- Ambulances lack structured patient information.

Our solution uses **Artificial Intelligence** to analyze emergency descriptions, determine severity, recommend the most suitable hospital, and notify all stakeholders in real time.

---

# 🎯 Objectives

- Reduce emergency response time.
- Improve hospital preparedness.
- Automatically identify emergency severity.
- Match patients with the best-equipped hospital.
- Provide live ambulance tracking.
- Notify emergency contacts instantly.

---

# 🏗 System Workflow

```text
                           HYBRID MOBILE APP
                    (Android App + PHP Backend)

 ┌─────────────────────────────────────────────────────────────────────┐
 │                         PATIENT / BYSTANDER                         │
 └─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                     Open Emergency App
                            │
                            ▼
                      Login / Register
                            │
                            ▼
                    One-Tap SOS Button
                            │
                            ▼
            Phone GPS gets Current Location
                            │
                            ▼
         User describes emergency using
           🎤 Voice or ⌨️ Text Input
                            │
                            ▼
           Speech-to-Text (if voice input)
                            │
                            ▼
          Gemini API analyzes emergency
                            │
      ┌────────────────────────────────────────────┐
      │ Detect emergency type                      │
      │ Predict severity                           │
      │ Assign priority (Red/Orange/Yellow)        │
      │ Recommend medical department               │
      │ Translate into medical English             │
      │ Generate structured case summary           │
      └────────────────────────────────────────────┘
                            │
                            ▼
                PHP Backend receives data
                            │
      ┌────────────────────────────────────────────┐
      │ Store emergency                            │
      │ Store location                             │
      │ Store AI response                          │
      │ Generate Emergency ID                      │
      └────────────────────────────────────────────┘
                            │
                            ▼
                Hospital Matching Engine
                            │
      Uses Google Maps API + Database
                            │
      ┌────────────────────────────────────────────┐
      │ Nearby Hospitals                           │
      │ Required Department                        │
      │ Hospital Specialty                         │
      │ Travel Time                                │
      │ Distance                                   │
      │ Bed Availability (Demo)                    │
      └────────────────────────────────────────────┘
                            │
                            ▼
              Best Hospital Selected
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
      Ambulance Dashboard          Hospital Dashboard
             │                             │
             ▼                             ▼
      Driver receives              Hospital receives
      Patient location             AI Case Summary
      Navigation                   Severity
      ETA                          Required Department
      Emergency Level              ETA
             │                             │
             └──────────────┬──────────────┘
                            ▼
                Ambulance Starts Journey
                            │
                            ▼
             Live GPS Tracking Updates
                            │
                            ▼
          Family receives notifications
                            │
                            ▼
            Hospital prepares emergency room
                            │
                            ▼
               Patient reaches hospital
                            │
                            ▼
             Emergency marked as completed
```

---

# 🚀 Core Features

## 👤 Patient Application

- User Registration & Login
- Medical Profile
- Emergency Contacts
- One-Tap SOS
- Voice/Text Emergency Description
- Live Ambulance Tracking
- Emergency History

---

## 🤖 AI Features (Gemini API)

- Emergency Type Detection
- Severity Prediction
- Priority Classification
- Medical Department Recommendation
- Medical English Translation
- AI Case Summary Generation

Example Output

```json
{
  "Emergency": "Heart Attack",
  "Severity": "Critical",
  "Priority": "RED",
  "Department": "Cardiology",
  "Recommendation": "Immediate Ambulance"
}
```

---

## 🗺 Google Maps Integration

- GPS Location Detection
- Nearby Hospital Search
- Distance Calculation
- ETA Prediction
- Fastest Route Navigation

---

## 🏥 Smart Hospital Matching

The system recommends the **best hospital**, not just the nearest one.

Selection Factors:

- Medical Specialty
- Distance
- ETA
- ICU Availability
- Bed Availability
- Emergency Department

---

## 🚑 Ambulance Dashboard

- Incoming Emergency Requests
- Patient Location
- Navigation
- ETA
- Emergency Priority
- Route Guidance

---

## 🏥 Hospital Dashboard

- Incoming Emergency Alerts
- AI Medical Summary
- Severity Level
- ETA
- Required Department
- Preparation Checklist

---

## 👨‍👩‍👧 Family Notification

- SMS Alert
- Live Tracking
- Assigned Hospital
- Ambulance Details
- Estimated Arrival Time

---

# 🛠 Technology Stack

## Frontend

- HTML5
- CSS3
- Bootstrap
- JavaScript

## Backend

- PHP
- MySQL

## Artificial Intelligence

- Gemini API

## Maps & Navigation

- Google Maps API
- Google Routes API
- Geolocation API

## Notifications

- Firebase Cloud Messaging
- Twilio SMS
- PHPMailer

## Version Control

- Git
- GitHub

---

# 📂 Project Modules

```
Patient Hybrid App
        │
        ├── Login
        ├── Medical Profile
        ├── SOS
        ├── Live Tracking
        └── Emergency History

Backend
        │
        ├── Authentication
        ├── AI Processing
        ├── Hospital Matching
        ├── Notifications
        └── Database

Hospital Dashboard
        │
        ├── Incoming Cases
        ├── AI Summary
        ├── ETA
        └── Preparation Status

Ambulance Dashboard
        │
        ├── Assigned Cases
        ├── Navigation
        ├── ETA
        └── Status Updates
```

---

# 📊 Expected Benefits

- Faster Emergency Response
- Reduced Ambulance Delay
- Better Hospital Preparation
- AI-Assisted Decision Making
- Improved Patient Survival Rate
- Centralized Emergency Coordination

---

# 👥 Team

- Add Team Member 1
- Add Team Member 2
- Add Team Member 3
- Add Team Member 4

---

# Optional Features

These features can be added after completing the core MVP.

## 🤖 AI
- AI Medical History Summary
- Image-based Injury Detection
- AI Emergency Risk Score
- AI First Aid Guidance
- Fake SOS Detection

## 🗺 Maps
- Live Ambulance Tracking
- Traffic-Aware Routing
- Road Closure Detection

## 🔔 Notifications
- SMS Alerts
- Email Notifications
- Push Notifications

## 👤 Patient
- Medical History
- Emergency History
- Multiple Emergency Contacts
- Blood Group
- Allergy Information

## 🏥 Hospital
- Bed Availability
- ICU Availability
- Doctor Availability
- Emergency Room Status

## 🚑 Ambulance
- Driver Profile
- Ambulance Status
- Driver Ratings

## 🌐 Advanced
- Multilingual Support
- Voice Responses
- Wear OS / Smartwatch SOS
- Offline Mode
- QR Medical Profile


file flow chart

# 📂 Project Structure

The project is organized into frontend, backend, database, and API integration modules.

```
MedAlert-AI/

│
├── index.html
├── login.html
├── register.html
│
├── patient/
│   ├── dashboard.html
│   ├── sos.html
│   ├── profile.html
│   └── tracking.html
│
├── hospital/
│   ├── dashboard.html
│   └── emergency.html
│
├── ambulance/
│   ├── dashboard.html
│   └── navigation.html
│
├── admin/
│   └── dashboard.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── auth.js
│   ├── sos.js
│   ├── maps.js
│   └── gemini.js
│
├── backend/
│
│   ├── config/
│   │    └── database.php
│   │
│   ├── auth/
│   │    ├── login.php
│   │    └── register.php
│   │
│   ├── emergency/
│   │    ├── create.php
│   │    └── update.php
│   │
│   ├── hospital/
│   │    └── match.php
│   │
│   ├── ambulance/
│   │    └── assign.php
│   │
│   └── ai/
│        └── gemini.php
│
└── database/
    └── medalert.sql
```

## Module Description

### Frontend
Contains the user interface for:

- Patient Application
- Hospital Dashboard
- Ambulance Dashboard
- Admin Dashboard

Technologies:
- HTML
- CSS
- Bootstrap
- JavaScript


### Backend
Handles:

- User authentication
- Emergency requests
- Hospital matching
- Ambulance assignment
- API communication


Technologies:
- PHP
- REST APIs


### Database

Stores:

- User details
- Medical profiles
- Hospital information
- Ambulance details
- Emergency records


Technology:
- MySQL


### AI Module

`gemini.php`

Handles:

- Emergency classification
- Severity prediction
- Medical department recommendation
- AI-generated emergency summary


### Maps Module

`maps.js`

Handles:

- GPS location
- Hospital search
- Distance calculation
- ETA tracking
