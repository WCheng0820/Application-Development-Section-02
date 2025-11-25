# Find Tutors Feature - Implementation Guide

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FindTutors Page                      │
│        (src/pages/FindTutors.jsx)                      │
├─────────────────────────────────────────────────────────┤
│  - Search Bar (Keywords)                                │
│  - Advanced Filters (Subject, Price, Experience, Rating)│
│  - Filter Management (Toggle, Clear, Active Count)      │
│  - Results Grid with TutorCard Components               │
└──────────────┬──────────────────────────────────────────┘
               │
               ├─── Uses ──→ TutorsController
               │
               └─── Renders → TutorCard Component
                             (src/components/TutorCard.jsx)

┌─────────────────────────────────────────────────────────┐
│            TutorCard Component                          │
│        (src/components/TutorCard.jsx)                  │
├─────────────────────────────────────────────────────────┤
│  - Quick view: Name, Subject, Rating, Rate, Bio preview│
│  - "View Profile" → Opens detailed modal dialog         │
│  - "Book Now" → Triggers booking handler                │
│                                                          │
│  Profile Dialog includes:                               │
│  - Full bio                                             │
│  - Detailed ratings and reviews                         │
│  - Experience and hourly rate                           │
│  - Available schedule                                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│            TutorsController                             │
│    (src/controllers/TutorsController.js)               │
├──────────────────────────────────────────────────────────┤
│  - fetchAllTutors()                                      │
│  - searchAndFilterTutors(filters)                        │
│  - getTutorDetails(id)                                   │
│  - getAvailableSubjects()                                │
│  - getPriceRange()                                       │
│  - getExperienceRange()                                  │
└──────────────┬───────────────────────────────────────────┘
               │
               └─── Uses ──→ TutorModel

┌──────────────────────────────────────────────────────────┐
│               TutorModel                                │
│       (src/models/TutorModel.js)                        │
├──────────────────────────────────────────────────────────┤
│  Data Layer:                                             │
│  - tutors array with 6 sample tutors                     │
│                                                          │
│  Functions:                                              │
│  - getAllTutors()                                        │
│  - filterTutors(filters) - Multi-criteria filtering      │
│  - getTutorById(id)                                      │
│  - getUniqueSubjects()                                   │
│  - getMaxRate()                                          │
│  - getMaxExperience()                                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Student Navigates to Find Tutors Page               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Page Loads - TutorsController.fetchAllTutors()       │
│    → Displays all 6 tutors in grid                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Student Uses Search Bar or Filters                  │
│                                                          │
│    Option A: Keyword Search                             │
│    - Searches name, subject, bio                         │
│                                                          │
│    Option B: Advanced Filters (can combine all)         │
│    - Subject dropdown                                    │
│    - Price range slider                                  │
│    - Experience slider                                   │
│    - Rating dropdown                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. System Filters Results                              │
│    TutorsController.searchAndFilterTutors(filters)      │
│    → Applies all selected filters                        │
│    → Updates displayed results in real-time              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Student Selects a Tutor                             │
│                                                          │
│    Option A: Click "View Profile"                       │
│    - Opens detailed modal with full information          │
│    - Shows bio, reviews, schedule, rate                 │
│    - Includes "Book This Tutor" button                   │
│                                                          │
│    Option B: Click "Book Now"                           │
│    - Direct booking action                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Booking Handler Executed                            │
│    handleBooking(tutor)                                  │
│    (Future: Opens booking form or navigates to form)     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Filter Capabilities

### 1. Keyword Search
- **Searches**: Tutor name, subject, and bio
- **Real-time**: Updates results as you type
- **Example**: Search "Mandarin" finds all Mandarin tutors

### 2. Subject Filter
- **Type**: Dropdown select
- **Options**: All available subjects (auto-generated from tutor data)
- **Subjects Available**:
  - Mandarin Chinese
  - English
  - Mathematics
  - Physics

### 3. Price Range Filter
- **Type**: Range slider
- **Range**: $0 - $40/hour
- **Default**: Full range
- **Behavior**: Filters to tutors with rate ≤ selected max

### 4. Experience Filter
- **Type**: Range slider
- **Range**: 0 - 10 years
- **Default**: 0 (no minimum)
- **Behavior**: Filters to tutors with experience ≥ selected min

### 5. Rating Filter
- **Type**: Dropdown select
- **Options**:
  - Any Rating (default)
  - 3★ & Above
  - 3.5★ & Above
  - 4★ & Above
  - 4.5★ & Above
- **Behavior**: Filters to tutors with rating ≥ selected value

### Filter Combinations
- All filters work together
- Results update immediately as any filter changes
- Active filter count shown in UI
- "Clear All" button resets all filters

---

## 📱 Responsive Design

### Desktop (md and up)
- Header: Full width
- Search/Filters: Full width in paper container
- Tutor Grid: 3 columns per row

### Tablet (sm to md)
- Same layout with adjusted spacing
- Tutor Grid: 2 columns per row
- Filters expand/collapse toggle available

### Mobile (xs to sm)
- Optimized layout
- Search bar: Full width
- Tutor Grid: 1 column (full width cards)
- Filters: Expandable section with compact inputs

---

## 🎨 UI Components Used

### From Material-UI (MUI)
- `Container` - Main layout wrapper
- `Typography` - Text elements
- `TextField` - Search input
- `Button` - Filter toggle, "View Profile", "Book Now"
- `Card` - Tutor card container
- `CardContent` - Card content area
- `CardActions` - Card action buttons
- `Grid` - Responsive grid layout
- `Slider` - Price and experience range filters
- `Select/MenuItem` - Subject and rating dropdowns
- `Dialog/DialogContent/DialogActions` - Profile modal
- `Avatar` - Tutor profile picture
- `Rating` - Star rating display
- `Chip` - Active filter count indicator
- `List/ListItem` - Schedule display in dialog
- `Paper` - Container for filters section
- `Collapse` - Expandable filters section
- `Box` - Flexible layout container

### Icons from MUI Icons
- `SearchIcon` - Search input icon
- `FilterListIcon` - Filter toggle icon
- `ClearIcon` - Clear filters icon
- `SchoolIcon` - Experience indicator
- `StarIcon` - Rating section indicator
- `AttachMoneyIcon` - Price indicator
- `CalendarTodayIcon` - Schedule indicator
- `ReviewsIcon` - Reviews indicator (available for use)

---

## 💾 Sample Data

### 6 Tutors Included:

| Name | Subject | Exp | Rating | Rate | Reviews |
|------|---------|-----|--------|------|---------|
| Ms. Chen | Mandarin Chinese | 5 yrs | 4.8 | $30/hr | 24 |
| Mr. Lee | English | 8 yrs | 4.9 | $35/hr | 42 |
| Ms. Wang | Mathematics | 6 yrs | 4.7 | $28/hr | 31 |
| Dr. Zhang | Physics | 10 yrs | 4.9 | $40/hr | 55 |
| Ms. Liu | Mandarin Chinese | 3 yrs | 4.6 | $22/hr | 18 |
| Mr. Patel | English | 7 yrs | 4.8 | $32/hr | 38 |

---

## 🔧 Technical Details

### State Management
```javascript
// FindTutors Page State
const [tutors, setTutors] = useState([]);              // All tutors
const [filteredTutors, setFilteredTutors] = useState([]); // Filtered results
const [expandFilters, setExpandFilters] = useState(false); // Filter toggle

// Filter States
const [keywords, setKeywords] = useState("");           // Search keywords
const [selectedSubject, setSelectedSubject] = useState(""); // Selected subject
const [priceRange, setPriceRange] = useState([0, 50]);  // Price range [min, max]
const [experienceRange, setExperienceRange] = useState([0, 10]); // Exp range
const [minRating, setMinRating] = useState(0);          // Minimum rating

// Configuration States
const [subjects, setSubjects] = useState([]);           // Available subjects
const [priceMax, setPriceMax] = useState(50);           // Max available price
const [experienceMax, setExperienceMax] = useState(10); // Max available exp
```

### Effect Hooks
1. **Initialize Effect**: Runs on component mount
   - Fetches all tutors
   - Gets available subjects and ranges
   - Sets initial filter values

2. **Filter Effect**: Runs when any filter changes
   - Calls `searchAndFilterTutors()` with current filters
   - Updates `filteredTutors` state
   - Automatically updates display

### Event Handlers
- `handleResetFilters()` - Resets all filters to defaults
- `handleBooking(tutor)` - Handles "Book Now" click (placeholder)
- `setKeywords()`, `setSelectedSubject()`, etc. - Filter state updates

---

## 🚀 How to Extend

### Adding More Tutors
Edit `src/models/TutorModel.js`:
```javascript
let tutors = [
  // ... existing tutors ...
  {
    id: 7,
    name: "New Tutor",
    subject: "New Subject",
    experience: 5,
    rating: 4.8,
    ratePerHour: 30,
    bio: "Bio text...",
    reviews: 20,
    schedule: ["Monday 10:00 AM", ...],
    imageUrl: "avatar-url"
  }
];
```

### Adding New Subjects
No code change needed! The subjects dropdown is dynamically generated from tutor data using `getUniqueSubjects()`.

### Connecting to Real API
Replace controller functions:
```javascript
export async function fetchAllTutors() {
  const response = await fetch('/api/tutors');
  return response.json();
}

export async function searchAndFilterTutors(filters) {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/tutors/search?${queryString}`);
  return response.json();
}
```

### Implementing Real Booking
Update `handleBooking()` in FindTutors.jsx:
```javascript
const handleBooking = (tutor) => {
  // Navigate to booking form
  navigate(`/booking/${tutor.id}`);
  // Or open a modal with booking form
  setSelectedTutor(tutor);
  setShowBookingForm(true);
};
```

---

## ✅ Checklist - Use Case Requirements

- [x] Student can navigate to "Find Tutors" page
- [x] System displays list of available tutors with brief details
- [x] System shows name, subject, rating, rate per hour on cards
- [x] Student can filter by subject
- [x] Student can filter by experience level
- [x] Student can filter by price range
- [x] Student can filter by rating
- [x] Student can search with keywords
- [x] Student can combine multiple filters
- [x] System retrieves and displays filtered results
- [x] Results update in real-time
- [x] Student can click on tutor's profile
- [x] Profile shows detailed information (bio, reviews, schedule)
- [x] Profile shows rating and review count
- [x] Profile shows experience and hourly rate
- [x] "Book Now" button available on both card and profile

---

