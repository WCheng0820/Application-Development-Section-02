// TutorsController.js
import axios from "axios";

// URL of your backend API
const API_URL = "http://localhost:8081/api/tutors";

// In-memory cache for tutors
let tutorsCache = [];

/**
 * Fetch tutors from the backend API
 */
export async function fetchTutors() {
  try {
    const response = await axios.get(API_URL);
    if (response.data.success && Array.isArray(response.data.data)) {
      // Map backend data to our frontend model
      tutorsCache = response.data.data.map((tutor) => ({
        id: tutor.tutor_id,
        name: tutor.name,
        subject: tutor.languages ? JSON.parse(tutor.languages).join(", ") : "",
        experience: tutor.experience_years,
        ratePerHour: tutor.hourly_rate,
        bio: tutor.bio,
        schedule: tutor.availability ? Object.entries(JSON.parse(tutor.availability)).map(([day, time]) => `${day} ${time}`) : [],
        email: tutor.email,
        phone: tutor.phone,
        createdAt: tutor.created_at,
        updatedAt: tutor.updated_at,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name.replace(/\s/g, "")}`,
      }));
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
  return tutorsCache.find((t) => t.id === id);
}
