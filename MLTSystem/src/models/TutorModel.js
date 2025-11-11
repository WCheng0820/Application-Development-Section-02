// Model for Tutors: holds tutor data and filtering logic
// Mandarin Learning Tutoring (MLT) System - Mandarin Chinese focused
const tutors = [
    {
    id: "T1",
    name: "Ms. Chen",
    subject: "Mandarin - Pro",
    experience: 5,
    rating: 4.8,
    ratePerHour: 30,
    bio: "Expert Mandarin conversation teacher with 5 years of teaching experience. Specializes in daily communication and cultural immersion. Native speaker from Beijing.",
    reviews: 24,
    schedule: ["Monday 10:00 AM", "Wednesday 4:30 PM", "Friday 2:00 PM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen"
  },
  {
    id: "T2",
    name: "Ms. Chen",
    subject: "Mandarin - Conversation",
    experience: 5,
    rating: 4.8,
    ratePerHour: 30,
    bio: "Expert Mandarin conversation teacher with 5 years of teaching experience. Specializes in daily communication and cultural immersion. Native speaker from Beijing.",
    reviews: 24,
    schedule: ["Monday 10:00 AM", "Wednesday 4:30 PM", "Friday 2:00 PM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen"
  },
  {
    id: "T3",
    name: "Mr. Wang",
    subject: "Mandarin - HSK Prep",
    experience: 8,
    rating: 4.9,
    ratePerHour: 35,
    bio: "Certified HSK exam specialist with 8 years of experience. Expert in HSK levels 1-6 preparation. Helped 200+ students achieve their target scores.",
    reviews: 42,
    schedule: ["Tuesday 3:00 PM", "Thursday 5:00 PM", "Saturday 10:00 AM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wang"
  },
  {
    id: "T4",
    name: "Ms. Liu",
    subject: "Mandarin - Beginners",
    experience: 6,
    rating: 4.7,
    ratePerHour: 28,
    bio: "Patient teacher specializing in absolute beginner Mandarin. Uses modern teaching methods and interactive learning. 6 years of one-on-one tutoring.",
    reviews: 31,
    schedule: ["Monday 1:00 PM", "Wednesday 3:00 PM", "Saturday 2:00 PM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liu"
  },
  {
    id: "T5",
    name: "Dr. Zhang",
    subject: "Mandarin - Advanced",
    experience: 10,
    rating: 4.9,
    ratePerHour: 40,
    bio: "PhD-educated Mandarin specialist with 10 years of teaching experience. Expert in advanced pronunciation, business Mandarin, and classical Chinese texts.",
    reviews: 55,
    schedule: ["Monday 4:00 PM", "Thursday 2:00 PM", "Friday 3:00 PM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang"
  },
  {
    id: "T6",
    name: "Ms. Xu",
    subject: "Mandarin - Conversation",
    experience: 3,
    rating: 4.6,
    ratePerHour: 22,
    bio: "Enthusiastic Mandarin teacher with 3 years of experience. Specializes in conversational practice and cultural immersion for beginners. Native Shanghai accent.",
    reviews: 18,
    schedule: ["Tuesday 10:00 AM", "Friday 4:00 PM", "Sunday 2:00 PM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Xu"
  },
  {
    id: "T7",
    name: "Mr. Guo",
    subject: "Mandarin - Business",
    experience: 7,
    rating: 4.8,
    ratePerHour: 32,
    bio: "Business Mandarin specialist with 7 years of corporate training experience. Expert in business communication, negotiations, and professional writing.",
    reviews: 38,
    schedule: ["Wednesday 2:00 PM", "Friday 5:00 PM", "Saturday 11:00 AM"],
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guo"
  }
];

export function getAllTutors() {
  return tutors.slice();
}

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
    filtered = filtered.filter(t => 
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
