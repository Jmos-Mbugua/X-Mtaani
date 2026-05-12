import { categories, sampleReports } from "../data/sampleData";

const STORAGE_KEY = "x-mtaani-reports";
const COMMENTS_KEY = "x-mtaani-comments";

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

export const getReports = () => {
  if (!canUseStorage()) {
    return sampleReports;
  }

  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));

  if (!Array.isArray(stored) || stored.length === 0) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReports));
    return sampleReports;
  }

  return stored;
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
    authorName: report.authorName || "Anonymous Resident",
    media: report.media || null,
    id: makeId("report"),
    createdAt: new Date().toISOString(),
  };
  const nextReports = [nextReport, ...reports];
  saveReports(nextReports);
  return nextReports;
};

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

export const filterReports = (reports, filters) =>
  reports.filter((report) => {
    const wardMatch = !filters.ward || report.ward === filters.ward;
    const constituencyMatch =
      !filters.constituency || report.constituency === filters.constituency;
    const categoryMatch = !filters.category || report.category === filters.category;

    return wardMatch && constituencyMatch && categoryMatch;
  });

export const getFilterOptions = (reports) => ({
  wards: [...new Set(reports.map((report) => report.ward))].sort(),
  constituencies: [...new Set(reports.map((report) => report.constituency))].sort(),
  categories,
});

export const getPriorityClusters = (reports) => {
  const clusters = reports.reduce((acc, report) => {
    const key = `${report.ward}|${report.constituency}|${report.category}`;

    if (!acc[key]) {
      acc[key] = {
        key,
        ward: report.ward,
        constituency: report.constituency,
        category: report.category,
        count: 0,
        latestReportAt: report.createdAt,
        reports: [],
      };
    }

    acc[key].count += 1;
    acc[key].reports.push(report);

    if (new Date(report.createdAt) > new Date(acc[key].latestReportAt)) {
      acc[key].latestReportAt = report.createdAt;
    }

    return acc;
  }, {});

  return Object.values(clusters).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
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
