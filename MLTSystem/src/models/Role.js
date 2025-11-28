// src/models/Role.js
export const ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  VIEW_TUTORS: 'view_tutors',
  BOOK_SESSIONS: 'book_sessions',
  VIEW_MATERIALS: 'view_materials',
  SEND_MESSAGES: 'send_messages',
  MANAGE_SESSIONS: 'manage_sessions',
  UPLOAD_MATERIALS: 'upload_materials',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports'
};

export class Role {
  constructor(name, permissions = []) {
    this.name = name;
    this.permissions = permissions;
  }

  // Static method to get default roles
  static getDefaultRoles() {
    return {
      [ROLES.STUDENT]: new Role(ROLES.STUDENT, [
        PERMISSIONS.VIEW_TUTORS,
        PERMISSIONS.BOOK_SESSIONS,
        PERMISSIONS.VIEW_MATERIALS,
        PERMISSIONS.SEND_MESSAGES
      ]),
      [ROLES.TUTOR]: new Role(ROLES.TUTOR, [
        PERMISSIONS.VIEW_TUTORS,
        PERMISSIONS.MANAGE_SESSIONS,
        PERMISSIONS.UPLOAD_MATERIALS,
        PERMISSIONS.SEND_MESSAGES
      ]),
      [ROLES.ADMIN]: new Role(ROLES.ADMIN, [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_SESSIONS,
        PERMISSIONS.UPLOAD_MATERIALS,
        PERMISSIONS.VIEW_REPORTS
      ])
    };
  }

  // Method to check if role has permission
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }
}
