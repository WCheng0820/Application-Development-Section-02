// src/models/User.js
export class User {
  constructor(id, email, password, role, profile = {}) {
    this.id = id;
    this.email = email;
    this.password = password; // In a real app, this would be hashed
    this.role = role; // 'student', 'tutor', 'admin'
    this.profile = profile; // { fullName, bio, etc. }
    // For tutors: approval status and verification documents
    this.isApproved = role === 'tutor' ? false : true; // Tutors need approval, others are auto-approved
    this.approvalStatus = role === 'tutor' ? 'pending' : 'approved'; // 'pending', 'approved', 'rejected'
    this.verificationDocuments = role === 'tutor' ? (profile.verificationDocuments || []) : [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Static method to create user from data
  static fromData(data) {
    const user = new User(
      data.id,
      data.email,
      data.password,
      data.role,
      data.profile
    );
    // Restore approval status if it exists
    if (data.isApproved !== undefined) {
      user.isApproved = data.isApproved;
    }
    if (data.approvalStatus !== undefined) {
      user.approvalStatus = data.approvalStatus;
    }
    if (data.verificationDocuments !== undefined) {
      user.verificationDocuments = data.verificationDocuments;
    }
    return user;
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

  // Method to approve tutor
  approve() {
    if (this.role === 'tutor') {
      this.isApproved = true;
      this.approvalStatus = 'approved';
      this.updatedAt = new Date();
    }
  }

  // Method to reject tutor
  reject() {
    if (this.role === 'tutor') {
      this.isApproved = false;
      this.approvalStatus = 'rejected';
      this.updatedAt = new Date();
    }
  }
}
