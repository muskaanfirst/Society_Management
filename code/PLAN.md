# Project SocMag - Feature Plan

## User Stories & Interfaces
We are building two distinct interfaces: **Student** and **Society Manager**.

### 1. Global Features
- **Login Screen:** Input for `thapar.edu` email. Includes two mock bypass buttons: "Login as Student" and "Login as Manager".

### 2. Student Interface (Bottom Nav: Societies, Feed, Slots, Profile)
- **Onboarding Quiz (Modal):** Pop-up to enter skills/interests. Generates a "Persona Match" score.
- **Societies Tab:** Lists all societies. 
  - *If Tech Society clicked:* Shows info -> "Take Proctored Assessment" button -> (Mock shortlisting) -> "Book In-Person Interview" button.
  - *If Non-Tech Society clicked:* Shows info -> "Fill Form & Upload" button -> (Mock shortlisting) -> "Book In-Person Interview" button.
- **Campus Feed Tab:** Interactive calendar showing upcoming events. Clicking a date opens a modal with time, venue, and description.
- **My Slots Tab:** Lists booked interviews (Date, Time, Venue).
- **Profile Tab:** Shows student details and Onboarding Quiz "Persona Match" results.

### 3. Society Manager Interface (Bottom Nav: My Society, Feed, Grading, Profile)
- **My Society Tab:** Lists all societies, but only allows editing/slot management for *their* assigned society.
- **Campus Feed Tab:** Same interactive calendar as the student view.
- **Grading Tab (Toggleable Views):**
  - *Tech View:* Table of student automated assessment scores with a "Shortlist" action.
  - *Non-Tech View:* Table simulating an Excel sheet of form responses. Buttons to grade Red (No), Yellow (Maybe), Green (Yes), and shortlist the Greens.
- **Profile Tab:** Manager details.