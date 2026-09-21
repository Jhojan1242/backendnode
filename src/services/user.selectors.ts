const publicProfileSelect = {
  firstName: true,
  lastName: true,
  bio: true,
  avatarUrl: true,
  city: true,
  region: true,
  country: true,
  totalDistanceKm: true
} as const;

const privateProfileSelect = {
  ...publicProfileSelect,
  latitude: true,
  longitude: true,
  favoritePace: true,
  createdAt: true,
  updatedAt: true
} as const;

const discoveryProfileSelect = {
  ...publicProfileSelect,
  latitude: true,
  longitude: true
} as const;

export const publicUserSelect = {
  id: true,
  username: true,
  role: true,
  isCoachValidated: true,
  createdAt: true,
  profile: {
    select: publicProfileSelect
  },
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
  profile: {
    select: privateProfileSelect
  },
  email: true
} as const;

export const discoverableUserSelect = {
  ...publicUserSelect,
  profile: {
    select: discoveryProfileSelect
  }
} as const;
