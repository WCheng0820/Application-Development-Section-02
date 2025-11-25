// TutorsModel.js
import axios from "axios";

const API_URL = "http://localhost:8081/api/tutors";

let tutors = []; // Local cache

// Fetch data from backend and populate local cache
export async function fetchTutors() {
  try {
    const response = await axios.get(API_URL);
    if (response.data.success) {
      // Transform API data to match your frontend model
      tutors = response.data.data.map(t => ({
        id: t.tutor_id,
        name: t.name,
        subject: t.languages.includes("Mandarin") ? "Mandarin" : "Other",
        experience: t.experience_years,
        rating: 4.8, // Or calculate from reviews if backend has rating
        ratePerHour: t.hourly_rate,
        bio: t.bio,
        reviews: 0, // You can fetch this from backend if available
        schedule: Object.entries(JSON.parse(t.availability)).map(
          ([day, time]) => `${day} ${time}`
        ),
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name.split(" ")[1]}`
      }));
    }
  } catch (err) {
    console.error("Failed to fetch tutors:", err);
  }
}

// Returns all tutors (after fetchTutors)
export function getAllTutors() {
  return tutors.slice();
}

// Filter tutors dynamically
export function filterTutors(filters = {}) {
  let filtered = tutors.slice();

  if (filters.subject && filters.subject !== "") {
    filtered = filtered.filter(t =>
      t.subject.toLowerCase().includes(filters.subject.toLowerCase())
    );
  }

  if (filters.minExperience !== undefined && filters.minExperience > 0) {
    filtered = filtered.filter(t => t.experience >= filters.minExperience);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    filtered = filtered.filter(t => t.ratePerHour <= filters.maxPrice);
  }

  if (filters.minRating !== undefined && filters.minRating > 0) {
    filtered = filtered.filter(t => t.rating >= filters.minRating);
  }

  if (filters.keywords && filters.keywords !== "") {
    const keywords = filters.keywords.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(keywords) ||
        t.subject.toLowerCase().includes(keywords) ||
        t.bio.toLowerCase().includes(keywords)
    );
  }

  return filtered;
}

export function getTutorById(id) {
  return tutors.find(t => t.id === id);
}

export function getUniqueSubjects() {
  return [...new Set(tutors.map(t => t.subject))].sort();
}

export function getMaxRate() {
  return Math.max(...tutors.map(t => t.ratePerHour));
}

export function getMaxExperience() {
  return Math.max(...tutors.map(t => t.experience));
}
