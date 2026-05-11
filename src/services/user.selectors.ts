export const publicUserSelect = {
  id: true,
  username: true,
  role: true,
  isCoachValidated: true,
  createdAt: true,
  profile: true,
  _count: {
    select: {
      posts: true,
      followers: true,
      following: true
    }
  }
} as const;

export const privateUserSelect = {
  ...publicUserSelect,
  email: true
} as const;
