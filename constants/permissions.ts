export const Resources = {
  COURSE: 'course',
  USER: 'user',
  COMMENT: 'comment',
  ORDER: 'order',
  PROFILE: 'profile',
  PERMISSION : 'permission',
  ROLEPERMISSION : 'role-permission'
} as const;

export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIKE: 'like',
  ENROLL: 'enroll',
  FAVORITE: 'favorite',
} as const;

export const Roles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  USER: 'user',
  REFEREE: 'referee',
  MENTOR: 'mentor',
} as const;

export type Resource = typeof Resources[keyof typeof Resources];
export type Action = typeof Actions[keyof typeof Actions];
export type Role = typeof Roles[keyof typeof Roles];