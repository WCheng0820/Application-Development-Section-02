// src/models/User.js
export class User {
  constructor(id, email, password, role, profile = {}) {
    this.id = id;
    this.email = email;
    this.password = password; // In a real app, this would be hashed
    this.role = role; // 'student', 'tutor', 'admin'
    this.profile = profile; // { fullName, bio, etc. }
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Static method to create user from data
  static fromData(data) {
    return new User(
      data.id,
      data.email,
      data.password,
      data.role,
      data.profile
    );
  }

  // Method to update profile
  updateProfile(newProfile) {
    this.profile = { ...this.profile, ...newProfile };
    this.updatedAt = new Date();
  }

  // Method to check if user has a specific role
  hasRole(role) {
    return this.role === role;
  }

  // Method to check if user has permission (for role-based access)
  hasPermission(permission) {
    const rolePermissions = {
      student: ['view_tutors', 'book_sessions', 'view_materials', 'send_messages'],
      tutor: ['view_students', 'manage_sessions', 'upload_materials', 'send_messages'],
      admin: ['manage_users', 'manage_tutors', 'manage_sessions', 'manage_materials', 'view_reports']
    };
    return rolePermissions[this.role]?.includes(permission) || false;
  }
}
