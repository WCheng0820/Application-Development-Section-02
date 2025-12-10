# Material Reports Implementation

## Overview
Material reporting feature has been implemented to allow students to flag/report materials. Reports are stored in the existing `reports` table without creating a separate table structure.

## Architecture

### Database
- **Table**: `reports` (existing table, no modifications)
- **Mapping for Material Reports**:
  - `reporter_id`: Student userId who flagged the material
  - `reported_id`: NULL (one-directional report, no specific user reported)
  - `target_type`: 'content'
  - `target_id`: material ID
  - `category`: 'material'
  - `description`: Reason provided by student
  - `evidence_url`: Material's web_view_link
  - `status`: 'pending' (initially)

### Backend (Port 5000)

**Route**: `/api/material-reports`

#### POST /api/material-reports
- **Auth**: Required (student token)
- **Body**:
  ```json
  {
    "materialId": <number>,
    "reason": "<string>"
  }
  ```
- **Response**: `{ success: true, message: "...", data: { id, materialId, reporterId, reason, status } }`
- **Logic**:
  1. Verify materialId exists in materials table
  2. Insert into reports table with field mappings above
  3. Include material's web_view_link as evidence_url

#### GET /api/material-reports
- **Auth**: Required (admin only)
- **Response**: `{ success: true, data: [reports] }`
- **Filters**: Only returns records where `target_type='content'` AND `category='material'`
- **Joins**: Materials table for material_title, users table for reporter_name

#### PATCH /api/material-reports/:id
- **Auth**: Required (admin only)
- **Body**:
  ```json
  {
    "status": "investigating|resolved|dismissed",
    "adminNotes": "<optional string>"
  }
  ```
- **Response**: `{ success: true, message: "..." }`
- **Logic**: Updates status and admin_notes, preserves target_type='content' filter

### Frontend (React/Vite)

**Component**: `MLTSystem/src/pages/Upload.jsx`

**Function**: `handleReportMaterial(material)`
- Prompts student for reason
- Makes POST request to `/api/material-reports`
- Includes Bearer token from localStorage
- Shows success/error alert

**Button**: FlagIcon component on each material card
- Opens report dialog on click
- Calls handleReportMaterial with material object

### Authentication

**Modified**: `Backend/app/middlewares/auth.js`
- Now returns `userId` field (required for reports table FK)
- Both `verifyToken` and `optionalAuth` middleware updated
- Ensures req.user.userId is populated for report submission

## Files Modified

### Backend
1. **app/routes/material-reports.js** (NEW)
   - POST /api/material-reports: Create report
   - GET /api/material-reports: List material reports (admin)
   - PATCH /api/material-reports/:id: Update report status (admin)
   - Uses existing reports table with proper field mappings

2. **app/middlewares/auth.js** (UPDATED)
   - Added `userId` to SELECT query in verifyToken
   - Added `userId` to SELECT query in optionalAuth
   - Ensures userId is available as req.user.userId

3. **server.js** (PREVIOUSLY UPDATED)
   - Routes already wired: `app.use('/api/material-reports', require('./app/routes/material-reports'));`

### Frontend
1. **src/pages/Upload.jsx** (UPDATED)
   - handleReportMaterial: Now makes actual API call to backend
   - Sends materialId + reason in request body
   - Includes authorization header with token
   - Shows success/error feedback to user

## Data Flow

### Report Submission
```
Student clicks FlagIcon on material card
    ↓
handleReportMaterial(material) called
    ↓
Prompt for reason
    ↓
POST /api/material-reports with {materialId, reason}
    ↓
Backend verifies material exists
    ↓
INSERT into reports with proper mappings:
  - reporter_id = student.userId
  - reported_id = NULL
  - target_type = 'content'
  - target_id = material.id
  - category = 'material'
  - description = reason
  - evidence_url = material.web_view_link
  - status = 'pending'
    ↓
Response: success alert to student
```

### Admin Review
```
Admin navigates to Reports section
    ↓
GET /api/material-reports (filtered for material reports)
    ↓
Display reported materials with:
  - Material title (from JOIN)
  - Reporter name (from JOIN)
  - Report reason (description)
  - Material link (evidence_url)
  - Status (pending/investigating/resolved/dismissed)
    ↓
Admin can PATCH /api/material-reports/:id
    ↓
Update status and add notes
```

## Testing Checklist

- [ ] Student logs in and navigates to Materials page
- [ ] FlagIcon appears on material cards
- [ ] Click FlagIcon → prompt for reason
- [ ] Submit reason → "reported successfully" message
- [ ] Check database: reports table has new record with:
  - reporter_id = student's userId
  - reported_id = NULL
  - target_type = 'content'
  - target_id = material id
  - category = 'material'
  - evidence_url = material link
- [ ] Admin visits Reports section
- [ ] Admin can see flagged materials
- [ ] Admin can update status and add notes

## Notes

- Reports are one-directional (no specific user is being reported, just the material content)
- Material link is stored in evidence_url for admin reference
- All material reports can be filtered by `target_type='content' AND category='material'`
- Used existing reports table structure with no modifications
