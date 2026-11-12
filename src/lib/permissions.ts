export const PERMISSIONS = [
  { key: 'categories.manage', label: 'Add / edit / delete categories' },
  { key: 'software.manage', label: 'Add / edit / delete software (projects)' },
  { key: 'images.manage', label: 'Upload / replace images (categories & software)' },
  { key: 'users.manage', label: 'Create / edit / delete users' },
  { key: 'roles.manage', label: 'Create / edit / delete roles' },
  { key: 'reviews.write', label: 'Write reviews' },
  { key: 'reviews.moderate', label: 'Approve / reject reviews (moderation screen)' },
  { key: 'expert.panel', label: 'Use the Expert panel (professional portfolio screen)' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const ALL_PERMISSIONS: string[] = PERMISSIONS.map((p) => p.key);

/** Roles created by the seed script. Names are locked in the UI. */
export const SYSTEM_ROLES = {
  admin: { description: 'Full access to everything', permissions: ALL_PERMISSIONS },
    citizen: {
    description: 'Reviews software and manages images for categories and software',
    permissions: ['images.manage', 'reviews.write'],
  },
  expert: {
    description: 'Builds a professional portfolio in the Expert panel',
    permissions: ['expert.panel'],
  },
} as const;

export const ADMIN_ROLE = 'admin';
