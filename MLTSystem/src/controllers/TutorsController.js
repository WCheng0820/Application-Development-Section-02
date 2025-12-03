// TutorsController.js
import axios from "axios";

// Backend base URL - use Vite env or default to backend server
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/tutors`;

console.log("TutorsController - API_BASE:", API_BASE);
console.log("TutorsController - API_URL:", API_URL);

// In-memory cache for tutors
let tutorsCache = [];

/**
 * Fetch tutors from the backend API and their schedules
 */
export async function fetchTutors() {
  try {
    const response = await axios.get(API_URL);
    console.log("API Response:", response.data);
    if (response.data.success && Array.isArray(response.data.data)) {
      // Map backend data to our frontend model
      tutorsCache = response.data.data.map((tutor) => {
        return {
          id: tutor.tutorId,
          name: tutor.name,
          experience: tutor.yearsOfExperience,
          ratePerHour: parseFloat(tutor.price) || 0,
          bio: tutor.bio || "",
          subject: tutor.specialization || "",
          // Preserve null when backend doesn't provide a rating so the UI
          // can show a placeholder (e.g. '—') instead of 0.0
          rating: tutor.rating != null ? parseFloat(tutor.rating) : null,
          ratingCount: tutor.rating_count != null ? parseInt(tutor.rating_count, 10) : 0,
          schedule: tutor.schedule || [],
          createdAt: tutor.created_at,
          updatedAt: tutor.updated_at,
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name.replace(/\s/g, "")}`,
        };
      });
      console.log("Mapped tutors cache:", tutorsCache);
    } else {
      console.warn("Unexpected response structure:", response.data);
    }
  } catch (error) {
    console.error("Error fetching tutors:", error);
  }
}

/**
 * Get all cached tutors
 */
export function getAllTutors() {
  return tutorsCache.slice();
}

/**
 * Filter tutors based on given criteria
 */
export function filterTutors(filters = {}) {
  let filtered = tutorsCache.slice();

  if (filters.subject && filters.subject !== "") {
    filtered = filtered.filter((t) =>
      t.subject.toLowerCase().includes(filters.subject.toLowerCase())
    );
  }

  if (filters.minExperience !== undefined && filters.minExperience > 0) {
    filtered = filtered.filter((t) => t.experience >= filters.minExperience);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    filtered = filtered.filter((t) => t.ratePerHour <= filters.maxPrice);
  }

  if (filters.minRating !== undefined && filters.minRating > 0) {
    // If you want rating filtering, ensure your tutors have a 'rating' field
    filtered = filtered.filter((t) => t.rating >= filters.minRating);
  }

  if (filters.keywords && filters.keywords !== "") {
    const keywords = filters.keywords.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(keywords) ||
        t.subject.toLowerCase().includes(keywords) ||
        t.bio.toLowerCase().includes(keywords)
    );
  }

  return filtered;
}

/**
 * Get unique subjects for filters
 */
export function getUniqueSubjects() {
  return [...new Set(tutorsCache.flatMap((t) => t.subject.split(", ")))].sort();
}

/**
 * Get maximum tutor rate
 */
export function getMaxRate() {
  return tutorsCache.length > 0
    ? Math.max(...tutorsCache.map((t) => t.ratePerHour))
    : 50;
}

/**
 * Get maximum experience years
 */
export function getMaxExperience() {
  return tutorsCache.length > 0
    ? Math.max(...tutorsCache.map((t) => t.experience))
    : 10;
}

/**
 * Get a single tutor by ID
 */
export function getTutorById(id) {
  if (id == null) return null;
  const sid = String(id);
  return tutorsCache.find((t) => String(t.id) === sid);
}
