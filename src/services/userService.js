const CURRENT_USER_KEY = "x-mtaani-current-user";
const LIKES_KEY = "x-mtaani-liked-posts";
const FOLLOWS_KEY = "x-mtaani-followed-users";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

const makeId = (prefix) =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

export const generateAnonymousName = () => {
  const prefixes = ["Mtaani Voice", "Anonymous Resident", "Neighbourhood Watch"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${Math.floor(100 + Math.random() * 9900)}`;
};

export const getCurrentUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  const stored = safeParse(window.localStorage.getItem(CURRENT_USER_KEY));
  return stored?.username ? stored : null;
};

export const saveCurrentUser = (username) => {
  const user = {
    id: makeId("user"),
    username: username.trim() || generateAnonymousName(),
    createdAt: new Date().toISOString(),
  };

  if (canUseStorage()) {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  return user;
};

export const getLikedPostIds = (userId) => {
  if (!canUseStorage() || !userId) {
    return [];
  }

  const stored = safeParse(window.localStorage.getItem(LIKES_KEY));
  return Array.isArray(stored?.[userId]) ? stored[userId] : [];
};

export const toggleLikedPost = (userId, reportId) => {
  if (!canUseStorage() || !userId) {
    return [];
  }

  const stored = safeParse(window.localStorage.getItem(LIKES_KEY)) || {};
  const liked = Array.isArray(stored[userId]) ? stored[userId] : [];
  const nextLiked = liked.includes(reportId)
    ? liked.filter((id) => id !== reportId)
    : [...liked, reportId];

  window.localStorage.setItem(
    LIKES_KEY,
    JSON.stringify({ ...stored, [userId]: nextLiked }),
  );

  return nextLiked;
};

export const getLikeCounts = () => {
  if (!canUseStorage()) {
    return {};
  }

  const stored = safeParse(window.localStorage.getItem(LIKES_KEY)) || {};

  return Object.values(stored).reduce((acc, likedIds) => {
    if (!Array.isArray(likedIds)) {
      return acc;
    }

    likedIds.forEach((id) => {
      acc[id] = (acc[id] || 0) + 1;
    });

    return acc;
  }, {});
};

export const getFollowedUsers = (userId) => {
  if (!canUseStorage() || !userId) {
    return [];
  }

  const stored = safeParse(window.localStorage.getItem(FOLLOWS_KEY));
  return Array.isArray(stored?.[userId]) ? stored[userId] : [];
};

export const toggleFollowedUser = (userId, username) => {
  if (!canUseStorage() || !userId || !username) {
    return [];
  }

  const stored = safeParse(window.localStorage.getItem(FOLLOWS_KEY)) || {};
  const followed = Array.isArray(stored[userId]) ? stored[userId] : [];
  const nextFollowed = followed.includes(username)
    ? followed.filter((item) => item !== username)
    : [...followed, username];

  window.localStorage.setItem(
    FOLLOWS_KEY,
    JSON.stringify({ ...stored, [userId]: nextFollowed }),
  );

  return nextFollowed;
};
