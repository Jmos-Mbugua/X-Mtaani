import {
  demoAccounts,
  generateSeedReports,
  generateSeedUsers,
} from "../data/sampleData";

// localStorage keys for the demo-only mock backend.
const USERS_KEY = "x-mtaani-users";
const CURRENT_USER_KEY = "x-mtaani-current-user";
const LIKES_KEY = "x-mtaani-liked-posts";
const FOLLOWS_KEY = "x-mtaani-followed-users";
const REPORTS_KEY = "x-mtaani-reports";
const COMMENTS_KEY = "x-mtaani-comments";
const REPOSTS_KEY = "x-mtaani-reposts";

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

const normalizeUser = (user) => ({
  id: user.id || makeId("user"),
  email: (user.email || "").trim().toLowerCase(),
  password: user.password || "",
  anonymousUsername:
    user.anonymousUsername || user.username || generateAnonymousName(),
  county: user.county || "Nairobi",
  constituency: user.constituency || "Roysambu",
  ward: user.ward || "Zimmerman",
  estate: user.estate || user.location || "Mirema",
  createdAt: user.createdAt || new Date().toISOString(),
  demo: Boolean(user.demo),
});

export const getUsers = () => {
  if (!canUseStorage()) {
    return generateSeedUsers();
  }

  const stored = safeParse(window.localStorage.getItem(USERS_KEY));

  if (!Array.isArray(stored) || stored.length === 0) {
    const seededUsers = generateSeedUsers();
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }

  if (stored.length < 200) {
    const existing = stored.map(normalizeUser);
    const existingEmails = new Set(existing.map((user) => user.email));
    const missingSeeds = generateSeedUsers().filter(
      (user) => !existingEmails.has(user.email),
    );
    const merged = [...existing, ...missingSeeds];
    window.localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    return merged;
  }

  const normalized = stored.map(normalizeUser);
  window.localStorage.setItem(USERS_KEY, JSON.stringify(normalized));
  return normalized;
};

export const saveUsers = (users) => {
  if (canUseStorage()) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users.map(normalizeUser)));
  }
};

export const getCurrentUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  const stored = safeParse(window.localStorage.getItem(CURRENT_USER_KEY));
  return stored?.email || stored?.anonymousUsername || stored?.username
    ? normalizeUser(stored)
    : null;
};

export const saveCurrentUser = (user) => {
  const normalized =
    typeof user === "string"
      ? normalizeUser({ anonymousUsername: user.trim() || generateAnonymousName() })
      : normalizeUser(user);
  if (canUseStorage()) {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized));
  }

  return normalized;
};

export const signUp = (form) => {
  const users = getUsers();
  const email = form.email.trim().toLowerCase();

  if (!email || !form.password.trim()) {
    return { ok: false, error: "Email and password are required." };
  }

  if (users.some((user) => user.email === email)) {
    return { ok: false, error: "That demo email is already registered." };
  }

  const user = normalizeUser({
    ...form,
    id: makeId("user"),
    email,
    password: form.password.trim(),
    anonymousUsername:
      form.anonymousUsername.trim() || generateAnonymousName(),
    createdAt: new Date().toISOString(),
  });
  const nextUsers = [user, ...users];
  saveUsers(nextUsers);
  saveCurrentUser(user);

  return { ok: true, user };
};

export const signIn = ({ email, password }) => {
  const users = getUsers();
  const user = users.find(
    (item) =>
      item.email === email.trim().toLowerCase() && item.password === password,
  );

  if (!user) {
    return { ok: false, error: "Invalid demo email or password." };
  }

  saveCurrentUser(user);
  return { ok: true, user };
};

export const signOut = () => {
  if (canUseStorage()) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getDemoAccounts = () =>
  demoAccounts.map((account) => {
    const user = getUsers().find((item) => item.email === account.email);
    return { ...account, user };
  });

export const resetDemoData = () => {
  const users = generateSeedUsers();
  const reports = generateSeedReports(users);

  if (canUseStorage()) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(COMMENTS_KEY);
    window.localStorage.removeItem(REPOSTS_KEY);
    window.localStorage.removeItem(LIKES_KEY);
    window.localStorage.removeItem(FOLLOWS_KEY);
  }

  return { users, reports };
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
