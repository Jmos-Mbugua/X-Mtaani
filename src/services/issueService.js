import { categories, sampleReports } from "../data/sampleData";

const STORAGE_KEY = "x-mtaani-reports";
const COMMENTS_KEY = "x-mtaani-comments";
const REPOSTS_KEY = "x-mtaani-reposts";

const seedAuthors = {
  "seed-1": { authorId: "seed-author-zimmerman-1", authorName: "Mtaani Voice 4821" },
  "seed-2": { authorId: "seed-author-zimmerman-2", authorName: "Anonymous Resident 304" },
  "seed-3": { authorId: "seed-author-zimmerman-3", authorName: "Estate Watch 719" },
  "seed-4": { authorId: "seed-author-kilimani-1", authorName: "Mtaa Observer 218" },
  "seed-5": { authorId: "seed-author-kilimani-2", authorName: "Clinic Queue 625" },
  "seed-6": { authorId: "seed-author-mwiki-1", authorName: "Transformer Watch 910" },
};

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

const normalizeReport = (report) => {
  const seedAuthor = seedAuthors[report.id] || {};

  return {
    ...report,
    authorId: seedAuthor.authorId || report.authorId || report.authorName || "anonymous-resident",
    authorName: seedAuthor.authorName || report.authorName || "Anonymous Resident",
    county: report.county || "Nairobi",
    media: report.media || null,
    archived: Boolean(report.archived),
    likes: Number.isFinite(report.likes) ? report.likes : 0,
    comments: Number.isFinite(report.comments) ? report.comments : 0,
    reposts: Number.isFinite(report.reposts) ? report.reposts : 0,
    verificationStatus: report.verificationStatus || "Unverified",
    issueStatus: report.issueStatus || "unresolved",
    resolvedAt: report.resolvedAt || null,
  };
};

const withSeedReports = (reports) => {
  if (reports.length >= 200) {
    return reports;
  }

  const existingIds = new Set(reports.map((report) => report.id));
  const missingSeeds = sampleReports.filter((report) => !existingIds.has(report.id));
  return [...reports, ...missingSeeds];
};

export const getReports = () => {
  if (!canUseStorage()) {
    return sampleReports;
  }

  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));

  if (!Array.isArray(stored) || stored.length === 0) {
    const normalized = sampleReports.map(normalizeReport);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  const normalized = withSeedReports(stored).map(normalizeReport);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const saveReports = (reports) => {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};

export const addReport = (report) => {
  const reports = getReports();
  const nextReport = {
    ...report,
    authorId: report.authorId || "anonymous-resident",
    authorName: report.authorName || "Anonymous Resident",
    media: report.media || null,
    county: report.county || "",
    archived: false,
    likes: report.likes || 0,
    comments: report.comments || 0,
    reposts: report.reposts || 0,
    verificationStatus: report.verificationStatus || "Unverified",
    issueStatus: report.issueStatus || "unresolved",
    id: makeId("report"),
    createdAt: new Date().toISOString(),
  };
  const nextReports = [nextReport, ...reports];
  saveReports(nextReports);
  return nextReports;
};

export const archiveReport = (reportId) => {
  const reports = getReports();
  const nextReports = reports.map((report) =>
    report.id === reportId
      ? { ...report, archived: true, archivedAt: new Date().toISOString() }
      : report,
  );
  saveReports(nextReports);
  return nextReports;
};

export const markReportResolved = ({ reportId, authorId }) => {
  const reports = getReports();
  let changed = false;
  const resolvedAt = new Date().toISOString();
  const nextReports = reports.map((report) => {
    if (report.id !== reportId || report.authorId !== authorId || report.issueStatus === "resolved") {
      return report;
    }

    changed = true;
    return {
      ...report,
      issueStatus: "resolved",
      verificationStatus: "Resolved",
      resolvedAt,
    };
  });

  if (!changed) {
    return { reports, comments: getComments(), changed: false };
  }

  saveReports(nextReports);
  const comments = getComments();
  const nextComments = [
    ...comments,
    {
      id: makeId("comment"),
      reportId,
      authorName: "X-Mtaani",
      body: "Original reporter marked this issue as resolved.",
      createdAt: resolvedAt,
      system: true,
    },
  ];
  saveComments(nextComments);

  return { reports: nextReports, comments: nextComments, changed: true };
};

export const getPublicReports = (reports) =>
  reports.filter((report) => !report.archived);

export const getComments = () => {
  if (!canUseStorage()) {
    return [];
  }

  const stored = safeParse(window.localStorage.getItem(COMMENTS_KEY));
  return Array.isArray(stored) ? stored : [];
};

export const saveComments = (comments) => {
  if (canUseStorage()) {
    window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
};

export const addComment = ({ reportId, authorName, body }) => {
  const comments = getComments();
  const nextComment = {
    id: makeId("comment"),
    reportId,
    authorName: authorName || "Anonymous Resident",
    body,
    createdAt: new Date().toISOString(),
  };
  const nextComments = [...comments, nextComment];
  saveComments(nextComments);
  return nextComments;
};

export const getCommentCount = (comments, reportId) =>
  comments.filter((comment) => comment.reportId === reportId).length;

export const getReposts = () => {
  if (!canUseStorage()) {
    return [];
  }

  const stored = safeParse(window.localStorage.getItem(REPOSTS_KEY));
  return Array.isArray(stored) ? stored : [];
};

export const saveReposts = (reposts) => {
  if (canUseStorage()) {
    window.localStorage.setItem(REPOSTS_KEY, JSON.stringify(reposts));
  }
};

export const toggleRepost = ({ reportId, userId, username }) => {
  if (!reportId || !userId) {
    return getReposts();
  }

  const reposts = getReposts();
  const existing = reposts.find(
    (repost) => repost.originalPostId === reportId && repost.userId === userId,
  );
  const nextReposts = existing
    ? reposts.filter((repost) => repost.id !== existing.id)
    : [
        {
          id: makeId("repost"),
          originalPostId: reportId,
          userId,
          username: username || "Anonymous Resident",
          createdAt: new Date().toISOString(),
        },
        ...reposts,
      ];

  saveReposts(nextReposts);
  return nextReposts;
};

export const getRepostCount = (reposts, reportId) =>
  reposts.filter((repost) => repost.originalPostId === reportId).length;

export const filterReports = (reports, filters) =>
  getPublicReports(reports).filter((report) => {
    const wardMatch = !filters.ward || report.ward === filters.ward;
    const constituencyMatch =
      !filters.constituency || report.constituency === filters.constituency;
    const categoryMatch = !filters.category || report.category === filters.category;

    return wardMatch && constituencyMatch && categoryMatch;
  });

export const getFilterOptions = (reports) => ({
  wards: [...new Set(getPublicReports(reports).map((report) => report.ward))].sort(),
  constituencies: [
    ...new Set(getPublicReports(reports).map((report) => report.constituency)),
  ].sort(),
  categories,
});

export const getPriorityClusters = (reports) => {
  const clusters = getPublicReports(reports).reduce((acc, report) => {
    const key = `${report.county}|${report.constituency}|${report.ward}|${report.category}`;

    if (!acc[key]) {
      acc[key] = {
        key,
        county: report.county,
        ward: report.ward,
        constituency: report.constituency,
        category: report.category,
        count: 0,
        resolvedCount: 0,
        unresolvedCount: 0,
        resolutionRate: 0,
        resolutionLabel: "Needs Attention",
        priorityScore: 0,
        latestReportAt: report.createdAt,
        reports: [],
      };
    }

    acc[key].count += 1;
    if (report.issueStatus === "resolved") {
      acc[key].resolvedCount += 1;
    } else {
      acc[key].unresolvedCount += 1;
    }
    acc[key].reports.push(report);

    if (new Date(report.createdAt) > new Date(acc[key].latestReportAt)) {
      acc[key].latestReportAt = report.createdAt;
    }

    return acc;
  }, {});

  return Object.values(clusters).map((cluster) => {
    const resolutionRate = cluster.count ? cluster.resolvedCount / cluster.count : 0;
    const resolutionLabel =
      resolutionRate >= 0.6 && cluster.count >= 3
        ? "Mostly Resolved"
        : resolutionRate > 0
          ? "Partially Resolved"
          : "Needs Attention";
    const priorityScore =
      resolutionLabel === "Mostly Resolved"
        ? cluster.unresolvedCount * 0.5
        : cluster.unresolvedCount * 2 + cluster.count;

    return {
      ...cluster,
      resolutionRate,
      resolutionLabel,
      priorityScore,
    };
  }).sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return new Date(b.latestReportAt) - new Date(a.latestReportAt);
  });
};

export const getCategoryLabel = (value) =>
  categories.find((category) => category.value === value)?.label || value;

export const generateStatusPost = (cluster) => {
  if (!cluster) {
    return "No reports yet. Add a local issue to generate an accountability post. #XMtaani #CivicAccountability";
  }

  const issueText = cluster.count === 1 ? "report" : "reports";

  return `${cluster.ward}, ${cluster.constituency}: residents have raised ${cluster.count} ${issueText} on ${getCategoryLabel(cluster.category).toLowerCase()}. Local leaders, please acknowledge this priority and share the action plan. #XMtaani #CivicAccountability`;
};
