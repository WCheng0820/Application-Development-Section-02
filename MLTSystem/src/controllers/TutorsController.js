// Controller for Tutors: orchestrates model operations
import * as TutorModel from "../models/TutorModel";

export function fetchAllTutors() {
  return TutorModel.getAllTutors();
}

export function searchAndFilterTutors(filters) {
  return TutorModel.filterTutors(filters);
}

export function getTutorDetails(id) {
  return TutorModel.getTutorById(id);
}

export function getAvailableSubjects() {
  return TutorModel.getUniqueSubjects();
}

export function getPriceRange() {
  return {
    max: TutorModel.getMaxRate(),
    min: 0
  };
}

export function getExperienceRange() {
  return {
    max: TutorModel.getMaxExperience(),
    min: 0
  };
}
