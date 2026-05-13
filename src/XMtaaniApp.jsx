import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Archive,
  BarChart3,
  Bell,
  ChevronDown,
  Clipboard,
  Compass,
  Heart,
  Home,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageCircle,
  Repeat2,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { categories, sampleLeaders } from "./data/sampleData";
import {
  addComment,
  addReport,
  archiveReport,
  filterReports,
  generateStatusPost,
  getCategoryLabel,
  getCommentCount,
  getComments,
  getFilterOptions,
  getPublicReports,
  getPriorityClusters,
  getRepostCount,
  getReposts,
  getReports,
  toggleRepost,
} from "./services/issueService";
import {
  generateAnonymousName,
  getCurrentUser,
  getDemoAccounts,
  getFollowedUsers,
  getLikeCounts,
  getLikedPostIds,
  resetDemoData,
  signIn,
  signOut,
  signUp,
  toggleFollowedUser,
  toggleLikedPost,
} from "./services/userService";

const initialForm = {
  title: "",
  category: "roads",
  ward: "",
  constituency: "",
  location: "",
  description: "",
  media: null,
};

const buildInitialReportForm = (user) => ({
  ...initialForm,
  ward: user?.ward || "",
  constituency: user?.constituency || "",
  location: user?.estate || "",
});

const initialAuthForm = {
  email: "",
  password: "",
  anonymousUsername: "",
  county: "Nairobi",
  constituency: "Roysambu",
  ward: "Zimmerman",
  estate: "Mirema",
};

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const compactSelectClass =
  "min-w-0 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const viewCopy = {
  home: ["Mtaani", "Anonymous civic reports from your area"],
  explore: ["Explore", "Priority clusters residents are raising now"],
  leaderboard: ["Leaderboard", "Leader responsiveness scorecard"],
  whatsNew: ["What's New", "Latest categories, reports, and civic updates"],
  dashboard: ["Dashboard", "Metrics and generated accountability report"],
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatReportDate(value) {
  if (!value) {
    return "community report";
  }

  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getAuthorName(report) {
  return report.authorName || "Anonymous Resident";
}

function getUserDisplayName(user) {
  return user?.anonymousUsername || user?.username || "Anonymous Resident";
}

function getAuthorId(report) {
  return report.authorId || getAuthorName(report);
}

function getVerificationStatus(report, commentCount = 0) {
  if (report.verificationStatus === "Resolved") {
    return "Resolved";
  }

  if (report.verificationStatus === "Community Confirmed" || commentCount >= 2) {
    return "Community Confirmed";
  }

  return "Unverified";
}

function getVerificationClass(status) {
  if (status === "Resolved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "Community Confirmed") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-stone-200 bg-stone-50 text-stone-600";
}

function getRatingLabel(score) {
  if (score === null) {
    return "No verified data yet";
  }

  if (score >= 80) {
    return "Strong response";
  }

  if (score >= 60) {
    return "Moderate response";
  }

  if (score >= 40) {
    return "Needs improvement";
  }

  return "Poor response";
}

function getMockIssueStatus(report, index) {
  if (report.verificationStatus === "Resolved") {
    return "resolved";
  }

  if (index % 5 === 0) {
    return "resolved";
  }

  if (index % 3 === 0) {
    return "pending verification";
  }

  return "unresolved";
}

function getLocationScope(report, user) {
  if (!user) {
    return "wider";
  }

  if (report.ward === user.ward) {
    return "ward";
  }

  if (report.constituency === user.constituency) {
    return "constituency";
  }

  if (report.county === user.county) {
    return "county";
  }

  return "wider";
}

const locationFeedSections = [
  {
    key: "ward",
    label: "Your Ward",
    description: "Closest reports from your ward",
  },
  {
    key: "constituency",
    label: "Your Constituency",
    description: "Nearby reports from the rest of your constituency",
  },
  {
    key: "county",
    label: "Your County",
    description: "County-wide civic reports",
  },
  {
    key: "wider",
    label: "Wider Civic Issues",
    description: "Other areas and broader civic priorities",
  },
];

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-full px-3 py-2 text-left text-sm font-bold transition ${
        active
          ? "bg-emerald-50 text-emerald-800"
          : "text-stone-800 hover:bg-stone-100"
      }`}
      type="button"
      onClick={onClick}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function MediaPreview({ media }) {
  if (!media?.dataUrl) {
    return null;
  }

  if (media.type?.startsWith("video/")) {
    return (
      <video
        className="mt-3 max-h-80 w-full rounded-2xl border border-stone-200 bg-stone-950 object-cover"
        controls
        src={media.dataUrl}
      />
    );
  }

  return (
    <img
      alt={media.name || "Attached report media"}
      className="mt-3 max-h-80 w-full rounded-2xl border border-stone-200 object-cover"
      src={media.dataUrl}
    />
  );
}

function ReportForm({ form, onChange, onMediaChange, onSubmit }) {
  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <Field label="Title">
        <input
          className={inputClass}
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="e.g. Broken drainage near market"
          required
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select
            className={inputClass}
            name="category"
            value={form.category}
            onChange={onChange}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ward">
          <input
            className={inputClass}
            name="ward"
            value={form.ward}
            onChange={onChange}
            placeholder="e.g. Zimmerman"
            required
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Constituency">
          <input
            className={inputClass}
            name="constituency"
            value={form.constituency}
            onChange={onChange}
            placeholder="e.g. Roysambu"
            required
          />
        </Field>
        <Field label="Location / Street">
          <input
            className={inputClass}
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="e.g. Mirema Drive"
            required
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          className={inputClass}
          name="description"
          value={form.description}
          onChange={onChange}
          rows="4"
          placeholder="What is happening, who is affected, and how long has it been going on?"
          required
        />
      </Field>

      <Field label="Media attachment">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-100">
          <ImagePlus size={17} aria-hidden="true" />
          {form.media ? form.media.name : "Attach image or video"}
          <input
            accept="image/*,video/*"
            className="sr-only"
            type="file"
            onChange={onMediaChange}
          />
        </label>
        <MediaPreview media={form.media} />
      </Field>

      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-sm font-black text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        type="submit"
      >
        <Send size={16} aria-hidden="true" />
        Post anonymous report
      </button>
    </form>
  );
}

function PostCard({
  report,
  commentCount,
  followed,
  liked,
  likeCount,
  reposted,
  repostCount,
  repostedBy,
  shareActive,
  currentUsername,
  currentUserId,
  onArchive,
  onComment,
  onFollow,
  onLike,
  onOpen,
  onRepost,
  onShare,
}) {
  const name = getAuthorName(report);
  const authorId = getAuthorId(report);
  const isOwnPost = currentUserId === authorId || currentUsername === name;
  const verificationStatus = getVerificationStatus(report, commentCount);

  return (
    <article className="border-b border-stone-200 px-4 py-4 transition hover:bg-stone-50">
      {repostedBy && (
        <div className="mb-2 flex items-center gap-2 pl-12 text-xs font-bold text-stone-500">
          <Repeat2 size={14} aria-hidden="true" />
          {repostedBy} reposted
        </div>
      )}
      <div className="flex gap-3">
        <button
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700"
          type="button"
          onClick={onOpen}
          aria-label={`Open report by ${name}`}
        >
          <Users size={18} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <button
              className="font-black text-stone-950 hover:underline"
              type="button"
              onClick={onOpen}
            >
              {name}
            </button>
            <span className="text-stone-400">@mtaani</span>
            <span className="text-stone-400">.</span>
            <span className="text-stone-500">{formatReportDate(report.createdAt)}</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-800">
              {getCategoryLabel(report.category)}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-black ${getVerificationClass(
                verificationStatus,
              )}`}
            >
              {verificationStatus}
            </span>
            {!isOwnPost && (
              <button
                className={`rounded-full px-3 py-1 text-xs font-black transition ${
                  followed
                    ? "border border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                    : "bg-stone-950 text-white hover:bg-stone-800"
                }`}
                type="button"
                onClick={() => onFollow(authorId)}
              >
                {followed ? "Following" : "Follow"}
              </button>
            )}
          </div>
          <button className="block w-full text-left" type="button" onClick={onOpen}>
            <h2 className="mt-1 text-base font-black leading-snug text-stone-950">
              {report.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-700">
              {report.description}
            </p>
            <MediaPreview media={report.media} />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
              <MapPin size={14} aria-hidden="true" />
              <span>{report.ward}</span>
              <span>/</span>
              <span>{report.constituency}</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-stone-400">
              Exact location hidden for reporter safety.
            </p>
          </button>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-stone-500 sm:max-w-md">
            <button
              className="inline-flex items-center gap-2 rounded-full transition hover:text-sky-600"
              type="button"
              onClick={onComment}
              aria-label="Comment"
            >
              <MessageCircle size={17} aria-hidden="true" />
              {commentCount}
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-full transition ${
                liked ? "text-rose-600" : "hover:text-rose-600"
              }`}
              type="button"
              onClick={onLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={17} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
              {likeCount}
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-full transition ${
                reposted ? "text-emerald-700" : "hover:text-emerald-700"
              }`}
              type="button"
              onClick={onRepost}
              aria-label={reposted ? "Undo repost" : "Repost"}
            >
              <Repeat2 size={17} aria-hidden="true" />
              {repostCount}
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-full transition ${
                shareActive ? "text-violet-700" : "hover:text-violet-700"
              }`}
              type="button"
              onClick={onShare}
              aria-label="Share"
            >
              <Share2 size={17} aria-hidden="true" />
              {shareActive ? "Copied" : "Share"}
            </button>
            {!isOwnPost && (
              <button
                className="inline-flex items-center gap-2 rounded-full transition hover:text-stone-950"
                type="button"
                onClick={() => onFollow(authorId)}
              >
                <UserPlus size={17} aria-hidden="true" />
                {followed ? "Following" : "Follow"}
              </button>
            )}
            {isOwnPost && (
              <button
                className="inline-flex items-center gap-2 rounded-full transition hover:text-amber-700"
                type="button"
                onClick={onArchive}
              >
                <Archive size={17} aria-hidden="true" />
                Archive
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function IdentityModal({ generatedName, identityName, onIdentityNameChange, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white">
            <Megaphone size={21} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black">Choose your anonymous name</h2>
            <p className="text-sm text-stone-500">This stays on this device.</p>
          </div>
        </div>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input
            className={inputClass}
            value={identityName}
            onChange={(event) => onIdentityNameChange(event.target.value)}
            placeholder={generatedName}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-700 px-5 py-2 text-sm font-black text-white transition hover:bg-emerald-800"
            type="submit"
          >
            Continue as {identityName.trim() || generatedName}
          </button>
        </form>
      </section>
    </div>
  );
}

function AuthGate({
  authMode,
  authForm,
  authError,
  generatedName,
  onAuthFormChange,
  onDemoFill,
  onModeChange,
  onResetDemoData,
  onSubmit,
}) {
  const isSignUp = authMode === "signup";
  const demoAccounts = getDemoAccounts();

  return (
    <main className="min-h-screen bg-white text-stone-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_440px]">
        <section>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white">
              <Megaphone size={24} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">X-Mtaani</h1>
              <p className="text-sm font-semibold text-stone-500">
                Demo-only civic reporting auth
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-stone-700">
            Sign in as a local anonymous resident to test the feed with seeded
            Kenyan locations. This is localStorage demo auth only and is not
            production-secure.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            Passwords are stored locally for demo testing only. Future versions
            should use a secure authentication provider.
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-full bg-stone-100 p-1">
            <button
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                !isSignUp ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
              }`}
              type="button"
              onClick={() => onModeChange("signin")}
            >
              Sign in
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                isSignUp ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
              }`}
              type="button"
              onClick={() => onModeChange("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="grid gap-3" onSubmit={onSubmit}>
            <Field label="Email">
              <input
                className={inputClass}
                name="email"
                type="email"
                value={authForm.email}
                onChange={onAuthFormChange}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Password">
              <input
                className={inputClass}
                name="password"
                type="password"
                value={authForm.password}
                onChange={onAuthFormChange}
                placeholder="Demo password"
                required
              />
            </Field>

            {isSignUp && (
              <>
                <Field label="Anonymous username">
                  <input
                    className={inputClass}
                    name="anonymousUsername"
                    value={authForm.anonymousUsername}
                    onChange={onAuthFormChange}
                    placeholder={generatedName}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="County">
                    <input
                      className={inputClass}
                      name="county"
                      value={authForm.county}
                      onChange={onAuthFormChange}
                      required
                    />
                  </Field>
                  <Field label="Constituency">
                    <input
                      className={inputClass}
                      name="constituency"
                      value={authForm.constituency}
                      onChange={onAuthFormChange}
                      required
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Ward">
                    <input
                      className={inputClass}
                      name="ward"
                      value={authForm.ward}
                      onChange={onAuthFormChange}
                      required
                    />
                  </Field>
                  <Field label="Private estate">
                    <input
                      className={inputClass}
                      name="estate"
                      value={authForm.estate}
                      onChange={onAuthFormChange}
                      required
                    />
                  </Field>
                </div>
              </>
            )}

            {authError && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {authError}
              </p>
            )}

            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-700 px-5 py-2 text-sm font-black text-white transition hover:bg-emerald-800"
              type="submit"
            >
              {isSignUp ? "Create demo account" : "Sign in"}
            </button>
          </form>

          {!isSignUp && (
            <section className="mt-5">
              <h2 className="text-sm font-black text-stone-950">Demo accounts</h2>
              <div className="mt-2 grid gap-2">
                {demoAccounts.map((account) => (
                  <button
                    className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-left transition hover:bg-stone-100"
                    key={account.email}
                    type="button"
                    onClick={() => onDemoFill(account)}
                  >
                    <p className="text-sm font-black text-stone-950">
                      {account.label}
                    </p>
                    <p className="text-xs font-semibold text-stone-500">
                      {account.email}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <button
            className="mt-5 w-full rounded-full border border-stone-200 px-4 py-2 text-sm font-black text-stone-700 transition hover:bg-stone-50"
            type="button"
            onClick={onResetDemoData}
          >
            Reset demo data
          </button>
        </section>
      </div>
    </main>
  );
}

function TrustSafetyCard() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="text-emerald-700" size={18} />
        <h2 className="font-black">Trust & Safety</h2>
      </div>
      <div className="grid gap-2 text-xs font-semibold leading-5 text-stone-600">
        <p>Reports are anonymous by default.</p>
        <p>Exact location is hidden publicly for reporter safety.</p>
        <p>Reports are labeled unverified until confirmed by community signals.</p>
        <p>Users can archive their own posts while preserving audit history.</p>
        <p>Misuse, harassment, ethnic hate, incitement, or election-period manipulation is not allowed.</p>
        <p>Future versions should add moderation, evidence review, rate limits, and trusted community verifiers.</p>
      </div>
    </section>
  );
}

export default function XMtaaniApp() {
  const storedUser = getCurrentUser();
  const [reports, setReports] = useState(() => getReports());
  const [comments, setComments] = useState(() => getComments());
  const [reposts, setReposts] = useState(() => getReposts());
  const [currentUser, setCurrentUser] = useState(() => storedUser);
  const [generatedName] = useState(() => generateAnonymousName());
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authError, setAuthError] = useState("");
  const [likedPostIds, setLikedPostIds] = useState(() =>
    getLikedPostIds(storedUser?.id),
  );
  const [followedUsers, setFollowedUsers] = useState(() =>
    getFollowedUsers(storedUser?.id),
  );
  const [likeCounts, setLikeCounts] = useState(() => getLikeCounts());
  const [filters, setFilters] = useState({
    ward: "",
    constituency: "",
    category: "",
  });
  const [form, setForm] = useState(() => buildInitialReportForm(storedUser));
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharedPostId, setSharedPostId] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const [dashboardSection, setDashboardSection] = useState("Reports");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);

  const publicReports = useMemo(() => getPublicReports(reports), [reports]);
  const filterOptions = useMemo(() => getFilterOptions(publicReports), [publicReports]);
  const filteredReports = useMemo(
    () => filterReports(publicReports, filters),
    [publicReports, filters],
  );
  const clusters = useMemo(() => getPriorityClusters(publicReports), [publicReports]);
  const topCluster = clusters[0];
  const statusPost = useMemo(() => generateStatusPost(topCluster), [topCluster]);
  const selectedReport = publicReports.find((report) => report.id === selectedReportId);
  const selectedComments = comments.filter(
    (comment) => comment.reportId === selectedReportId,
  );

  const topCategories = useMemo(
    () =>
      clusters
        .reduce((acc, cluster) => {
          const existing = acc.find((item) => item.category === cluster.category);
          if (existing) {
            existing.count += cluster.count;
          } else {
            acc.push({ category: cluster.category, count: cluster.count });
          }
          return acc;
        }, [])
        .sort((a, b) => b.count - a.count)
        .slice(0, 4),
    [clusters],
  );

  const dashboardStats = [
    { label: "Reports", value: publicReports.length },
    { label: "Wards", value: filterOptions.wards.length },
    { label: "Clusters", value: clusters.length },
    { label: "X Report", value: topCluster ? "Ready" : "Empty" },
  ];

  const feedItems = useMemo(() => {
    const originals = filteredReports.map((report) => ({
      id: `post-${report.id}`,
      type: "post",
      report,
      scope: getLocationScope(report, currentUser),
      createdAt: report.createdAt,
    }));
    const repostItems = reposts
      .map((repost) => {
        const report = publicReports.find(
          (item) => item.id === repost.originalPostId,
        );

        if (!report) {
          return null;
        }

        return {
          id: repost.id,
          type: "repost",
          report,
          repost,
          scope: getLocationScope(report, currentUser),
          createdAt: repost.createdAt,
        };
      })
      .filter(Boolean);

    return [...originals, ...repostItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [currentUser, filteredReports, publicReports, reposts]);

  const locationFeedGroups = useMemo(
    () =>
      locationFeedSections.map((section) => ({
        ...section,
        items: feedItems.filter((item) => item.scope === section.key),
      })),
    [feedItems],
  );

  const navigate = (view) => {
    setActiveView(view);
    setSelectedReportId(null);
  };

  const updateForm = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const updateMedia = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setForm((current) => ({ ...current, media: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        media: {
          name: file.name,
          type: file.type,
          dataUrl: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateFilter = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const syncSignedInUser = (user) => {
    setCurrentUser(user);
    setLikedPostIds(getLikedPostIds(user.id));
    setFollowedUsers(getFollowedUsers(user.id));
    setForm((current) => ({
      ...current,
      ward: current.ward || user.ward,
      constituency: current.constituency || user.constituency,
      location: current.location || user.estate,
    }));
  };

  const updateAuthForm = (event) => {
    setAuthForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitAuth = (event) => {
    event.preventDefault();
    const result =
      authMode === "signup"
        ? signUp({
            ...authForm,
            anonymousUsername:
              authForm.anonymousUsername.trim() || generatedName,
          })
        : signIn(authForm);

    if (!result.ok) {
      setAuthError(result.error);
      return;
    }

    setAuthError("");
    syncSignedInUser(result.user);
  };

  const fillDemoAccount = (account) => {
    setAuthMode("signin");
    setAuthError("");
    setAuthForm((current) => ({
      ...current,
      email: account.email,
      password: account.password,
    }));
  };

  const resetDemo = () => {
    if (!window.confirm("Reset demo users, reports, and social activity?")) {
      return;
    }

    const reset = resetDemoData();
    setReports(reset.reports);
    setComments([]);
    setReposts([]);
    setCurrentUser(null);
    setLikedPostIds([]);
    setFollowedUsers([]);
    setLikeCounts({});
    setAuthError("");
    setAuthMode("signin");
    setAuthForm(initialAuthForm);
  };

  const handleSignOut = () => {
    signOut();
    setCurrentUser(null);
    setLikedPostIds([]);
    setFollowedUsers([]);
    setSelectedReportId(null);
    setSelectedLeader(null);
  };

  const submitReport = (event) => {
    event.preventDefault();

    const cleaned = {
      title: form.title.trim(),
      category: form.category,
      ward: form.ward.trim(),
      constituency: form.constituency.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      media: form.media,
      authorId: currentUser?.id || "anonymous-resident",
      authorName: getUserDisplayName(currentUser),
      county: currentUser?.county || "",
    };

    if (
      !cleaned.title ||
      !cleaned.ward ||
      !cleaned.constituency ||
      !cleaned.location ||
      !cleaned.description
    ) {
      return;
    }

    setReports(addReport(cleaned));
    setForm(buildInitialReportForm(currentUser));
    setPostOpen(false);
    setActiveView("home");
  };

  const openReport = (reportId) => {
    setSelectedReportId(reportId);
    setActiveView("home");
  };

  const toggleLike = (reportId) => {
    const nextLiked = toggleLikedPost(currentUser?.id, reportId);
    setLikedPostIds(nextLiked);
    setLikeCounts(getLikeCounts());
  };

  const toggleFollow = (authorId) => {
    setFollowedUsers(toggleFollowedUser(currentUser?.id, authorId));
  };

  const archiveOwnPost = (report) => {
    if (
      currentUser?.id !== getAuthorId(report) &&
      getUserDisplayName(currentUser) !== getAuthorName(report)
    ) {
      return;
    }

    setReports(archiveReport(report.id));
    if (selectedReportId === report.id) {
      setSelectedReportId(null);
    }
  };

  const toggleUserRepost = (reportId) => {
    setReposts(
      toggleRepost({
        reportId,
        userId: currentUser?.id,
        username: getUserDisplayName(currentUser),
      }),
    );
  };

  const shareReport = async (report) => {
    const url = `${window.location.origin}${window.location.pathname}#post-${report.id}`;
    const text = `${report.title} - ${report.ward}, ${report.constituency}. ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: report.title, text, url });
      } else {
        await navigator.clipboard.writeText(text);
      }

      setSharedPostId(report.id);
      window.setTimeout(() => setSharedPostId(""), 1800);
    } catch {
      setSharedPostId("");
    }
  };

  const submitComment = (event) => {
    event.preventDefault();
    const body = commentText.trim();

    if (!selectedReportId || !body) {
      return;
    }

    setComments(
      addComment({
        reportId: selectedReportId,
        authorName: getUserDisplayName(currentUser),
        body,
      }),
    );
    setCommentText("");
  };

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(statusPost);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const renderPost = (report, repostedBy = "") => (
    <PostCard
      key={repostedBy ? `${report.id}-${repostedBy}` : report.id}
      report={report}
      commentCount={(report.comments || 0) + getCommentCount(comments, report.id)}
      followed={followedUsers.includes(getAuthorId(report))}
      liked={likedPostIds.includes(report.id)}
      likeCount={(report.likes || 0) + (likeCounts[report.id] || 0)}
      reposted={reposts.some(
        (repost) =>
          repost.originalPostId === report.id && repost.userId === currentUser?.id,
      )}
      repostCount={(report.reposts || 0) + getRepostCount(reposts, report.id)}
      repostedBy={repostedBy}
      shareActive={sharedPostId === report.id}
      currentUsername={getUserDisplayName(currentUser)}
      currentUserId={currentUser?.id}
      onArchive={() => archiveOwnPost(report)}
      onComment={() => openReport(report.id)}
      onFollow={toggleFollow}
      onLike={() => toggleLike(report.id)}
      onOpen={() => openReport(report.id)}
      onRepost={() => toggleUserRepost(report.id)}
      onShare={() => shareReport(report)}
    />
  );

  const renderFeed = () => (
    <>
      <div className="border-b border-stone-200 px-4 py-3">
        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:bg-stone-100"
          type="button"
          onClick={() => setPostOpen(true)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <Users size={18} aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-stone-500">
            Report a local issue anonymously...
          </span>
        </button>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-500">
          Showing reports near {currentUser.ward}, {currentUser.constituency}
        </p>
      </div>

      <div>
        {locationFeedGroups.map((section) =>
          section.items.length > 0 ? (
            <section key={section.key}>
              <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
                <h2 className="text-sm font-black text-stone-950">
                  {section.label}
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  {section.description}
                </p>
              </div>
              {section.items.map((item) =>
                renderPost(item.report, item.repost ? item.repost.username : ""),
              )}
            </section>
          ) : null,
        )}

        {feedItems.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="font-black text-stone-950">No reports found</p>
            <p className="mt-1 text-sm text-stone-500">
              Try clearing a filter or post the first report for this area.
            </p>
          </div>
        )}
      </div>
    </>
  );

  const renderDetail = () => {
    if (!selectedReport) {
      return renderFeed();
    }

    return (
      <div>
        <div className="border-b border-stone-200 px-4 py-3">
          <button
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-stone-700 transition hover:bg-stone-100"
            type="button"
            onClick={() => setSelectedReportId(null)}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </button>
        </div>
        {renderPost(selectedReport)}
        <form className="border-b border-stone-200 px-4 py-4" onSubmit={submitComment}>
          <label className="sr-only" htmlFor="comment">
            Add comment
          </label>
          <textarea
            className={inputClass}
            id="comment"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            rows="3"
            placeholder="Add a comment anonymously..."
          />
          <button
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800"
            type="submit"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Comment
          </button>
        </form>
        <div>
          {selectedComments.map((comment) => (
            <article className="border-b border-stone-200 px-4 py-4" key={comment.id}>
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                  <Users size={16} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-black text-stone-950">
                      {comment.authorName}
                    </span>
                    <span className="text-stone-400">.</span>
                    <span className="text-stone-500">
                      {formatReportDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-700">
                    {comment.body}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {selectedComments.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-semibold text-stone-500">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExplore = () => (
    <div className="grid gap-0">
      {clusters.map((cluster, index) => (
        <article className="border-b border-stone-200 px-4 py-4" key={cluster.key}>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            Trending in {cluster.ward}
          </p>
          <div className="mt-1 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-950">
                {getCategoryLabel(cluster.category)}
              </h2>
              <p className="text-sm text-stone-600">
                {cluster.constituency} / latest {formatReportDate(cluster.latestReportAt)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-800">
              #{index + 1}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-stone-700">
            {cluster.count} community reports in this cluster
          </p>
        </article>
      ))}
    </div>
  );

  const getLeaderIssues = (leader) =>
    publicReports
      .filter(
        (report) =>
          leader.area.includes(report.ward) ||
          leader.area.includes(report.constituency),
      )
      .map((report, index) => ({
        ...report,
        accountabilityStatus: getMockIssueStatus(report, index),
      }));

  const getLeaderRating = (leader) => {
    const issues = getLeaderIssues(leader);
    const resolved = issues.filter(
      (issue) => issue.accountabilityStatus === "resolved",
    ).length;
    const unresolved = issues.filter(
      (issue) => issue.accountabilityStatus !== "resolved",
    ).length;
    const total = resolved + unresolved;

    return {
      issues,
      resolved,
      unresolved,
      score: total === 0 ? null : Math.round((resolved / total) * 100),
    };
  };

  const renderLeaderboard = () => (
    <div className="grid gap-0">
      {sampleLeaders.map((leader) => {
        const rating = getLeaderRating(leader);

        return (
        <button
          className="border-b border-stone-200 px-4 py-4 text-left transition hover:bg-stone-50"
          key={leader.id}
          type="button"
          onClick={() => setSelectedLeader(leader)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-stone-950">{leader.name}</h2>
              <p className="text-sm text-stone-500">
                {leader.role} / {leader.area}
              </p>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                Community accountability estimate
              </p>
            </div>
            <span className="rounded-full bg-emerald-700 px-3 py-1 text-sm font-black text-white">
              {rating.score ?? "N/A"}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-stone-600">
            {getRatingLabel(rating.score)} / unresolved issues: {rating.unresolved}
          </p>
        </button>
        );
      })}
    </div>
  );

  const renderWhatsNew = () => (
    <div>
      <section className="border-b border-stone-200 px-4 py-4">
        <h2 className="font-black text-stone-950">Latest categories</h2>
        <div className="mt-3 grid gap-2">
          {topCategories.map((item) => (
            <div
              className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm"
              key={item.category}
            >
              <span className="font-bold text-stone-700">
                {getCategoryLabel(item.category)}
              </span>
              <span className="font-black text-stone-950">{item.count}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="border-b border-stone-200 px-4 py-4">
        <h2 className="font-black text-stone-950">Recent reports</h2>
        <div className="mt-3 grid gap-3">
          {publicReports.slice(0, 4).map((report) => (
            <button
              className="rounded-xl bg-stone-50 p-3 text-left transition hover:bg-stone-100"
              key={report.id}
              type="button"
              onClick={() => openReport(report.id)}
            >
              <p className="text-sm font-black text-stone-950">{report.title}</p>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                {report.ward} / {formatReportDate(report.createdAt)}
              </p>
            </button>
          ))}
        </div>
      </section>
      <section className="px-4 py-4">
        <h2 className="font-black text-stone-950">Recent civic updates</h2>
        <div className="mt-3 grid gap-3 text-sm text-stone-700">
          <p className="rounded-xl bg-stone-50 p-3">
            Priority clusters refresh instantly as residents add new reports.
          </p>
          <p className="rounded-xl bg-stone-50 p-3">
            Generated X reports are ready for the highest-priority issue.
          </p>
        </div>
      </section>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          {dashboardStats.map((item) => (
            <button
              className={`rounded-xl px-2 py-3 text-center transition ${
                dashboardSection === item.label
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-stone-50 text-stone-700 hover:bg-stone-100"
              }`}
              key={item.label}
              type="button"
              onClick={() => setDashboardSection(item.label)}
            >
              <p className="text-[11px] font-bold">{item.label}</p>
              <p className="mt-1 text-sm font-black">{item.value}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-stone-200 px-4 py-4">
        <TrustSafetyCard />
      </div>
      {dashboardSection === "Reports" && renderFeed()}
      {dashboardSection === "Wards" && (
        <div className="grid gap-0">
          {filterOptions.wards.map((ward) => (
            <article className="border-b border-stone-200 px-4 py-4" key={ward}>
              <h2 className="font-black text-stone-950">{ward}</h2>
              <p className="text-sm text-stone-600">
                {publicReports.filter((report) => report.ward === ward).length} reports
              </p>
            </article>
          ))}
        </div>
      )}
      {dashboardSection === "Clusters" && renderExplore()}
      {dashboardSection === "X Report" && (
        <section className="px-4 py-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h2 className="font-black text-stone-950">Generated X report</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">{statusPost}</p>
            <button
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-stone-900 transition hover:bg-stone-50"
              type="button"
              onClick={copyPost}
            >
              <Clipboard size={16} aria-hidden="true" />
              {copied ? "Copied" : "Copy X report"}
            </button>
          </div>
        </section>
      )}
    </div>
  );

  const renderCenter = () => {
    if (selectedReportId) {
      return renderDetail();
    }

    if (activeView === "explore") {
      return renderExplore();
    }

    if (activeView === "leaderboard") {
      return renderLeaderboard();
    }

    if (activeView === "whatsNew") {
      return renderWhatsNew();
    }

    if (activeView === "dashboard") {
      return renderDashboard();
    }

    return renderFeed();
  };

  if (!currentUser) {
    return (
      <AuthGate
        authMode={authMode}
        authForm={authForm}
        authError={authError}
        generatedName={generatedName}
        onAuthFormChange={updateAuthForm}
        onDemoFill={fillDemoAccount}
        onModeChange={setAuthMode}
        onResetDemoData={resetDemo}
        onSubmit={submitAuth}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white pb-16 text-stone-950 lg:pb-0">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[88px_minmax(0,620px)_340px] xl:grid-cols-[250px_minmax(0,640px)_360px]">
        <aside className="sticky top-0 z-20 hidden h-screen border-r border-stone-200 bg-white px-3 py-4 lg:flex lg:flex-col">
          <div className="mb-5 flex items-center gap-2 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white">
              <Megaphone size={21} aria-hidden="true" />
            </div>
            <div className="hidden xl:block">
              <p className="text-lg font-black tracking-tight">X-Mtaani</p>
              <p className="text-xs font-semibold text-stone-500">civic feed</p>
            </div>
          </div>

          <nav className="grid gap-1">
            <SidebarItem
              icon={Home}
              label="Home / Mtaani"
              active={activeView === "home" && !selectedReportId}
              onClick={() => navigate("home")}
            />
            <SidebarItem
              icon={Compass}
              label="Explore"
              active={activeView === "explore"}
              onClick={() => navigate("explore")}
            />
            <SidebarItem
              icon={Trophy}
              label="Leaderboard"
              active={activeView === "leaderboard"}
              onClick={() => navigate("leaderboard")}
            />
            <SidebarItem
              icon={Bell}
              label="What's New"
              active={activeView === "whatsNew"}
              onClick={() => navigate("whatsNew")}
            />

            <button
              className={`flex w-full items-center justify-between rounded-full px-3 py-2 text-left text-sm font-bold transition ${
                activeView === "dashboard"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-800 hover:bg-stone-100"
              }`}
              type="button"
              onClick={() => {
                setDashboardOpen((current) => !current);
                navigate("dashboard");
              }}
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard size={20} aria-hidden="true" />
                <span className="hidden xl:inline">Dashboard</span>
              </span>
              <ChevronDown
                className={`hidden transition xl:block ${dashboardOpen ? "rotate-180" : ""}`}
                size={16}
                aria-hidden="true"
              />
            </button>

            {dashboardOpen && (
              <div className="ml-0 grid gap-1 rounded-2xl bg-stone-50 p-2 xl:ml-9">
                {dashboardStats.map((item) => (
                  <button
                    className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 text-xs transition hover:bg-white"
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setDashboardSection(item.label);
                      navigate("dashboard");
                    }}
                  >
                    <span className="hidden font-semibold text-stone-500 xl:inline">
                      {item.label}
                    </span>
                    <span className="font-black text-stone-900">{item.value}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>

          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            type="button"
            onClick={() => setPostOpen(true)}
          >
            <Send size={18} aria-hidden="true" />
            <span className="hidden xl:inline">Post</span>
          </button>

          <div className="mt-auto hidden rounded-2xl bg-stone-50 p-3 xl:block">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Current anonymous user
            </p>
            <p className="mt-1 text-sm font-black text-stone-950">
              {getUserDisplayName(currentUser)}
            </p>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              {currentUser.ward}, {currentUser.constituency} / {currentUser.county}
            </p>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              Following {followedUsers.length}
            </p>
            <button
              className="mt-3 w-full rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black text-stone-700 transition hover:bg-stone-100"
              type="button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </aside>

        <section className="min-w-0 border-r border-stone-200">
          <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  {selectedReportId ? "Post" : viewCopy[activeView][0]}
                </h1>
                <p className="text-sm text-stone-500">
                  {selectedReportId ? "Conversation thread" : viewCopy[activeView][1]}
                </p>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white"
                  type="button"
                  onClick={() => setPostOpen(true)}
                >
                  <Send size={16} aria-hidden="true" />
                  Post
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-stone-200 px-3 py-2 text-sm font-black text-stone-700"
                  type="button"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>

            {activeView === "home" && !selectedReportId && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <select
                  className={compactSelectClass}
                  name="ward"
                  value={filters.ward}
                  onChange={updateFilter}
                  aria-label="Filter by ward"
                >
                  <option value="">All wards</option>
                  {filterOptions.wards.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
                <select
                  className={compactSelectClass}
                  name="constituency"
                  value={filters.constituency}
                  onChange={updateFilter}
                  aria-label="Filter by constituency"
                >
                  <option value="">All constituencies</option>
                  {filterOptions.constituencies.map((constituency) => (
                    <option key={constituency} value={constituency}>
                      {constituency}
                    </option>
                  ))}
                </select>
                <select
                  className={compactSelectClass}
                  name="category"
                  value={filters.category}
                  onChange={updateFilter}
                  aria-label="Filter by category"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </header>

          {renderCenter()}
        </section>

        <aside className="hidden bg-white px-4 py-4 lg:block">
          <div className="sticky top-4 grid gap-4">
            <section className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="text-emerald-700" size={18} />
                <h2 className="font-black">Priority Dashboard</h2>
              </div>

              {topCluster ? (
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-stone-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                      Top issue cluster
                    </p>
                    <h3 className="mt-1 text-lg font-black text-stone-950">
                      {getCategoryLabel(topCluster.category)}
                    </h3>
                    <p className="text-sm text-stone-600">
                      {topCluster.ward}, {topCluster.constituency}
                    </p>
                    <p className="mt-2 text-3xl font-black text-emerald-700">
                      {topCluster.count}
                    </p>
                    <p className="text-xs font-semibold text-stone-500">
                      community reports
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-700">
                    {statusPost}
                  </div>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-stone-900 transition hover:bg-stone-50"
                    type="button"
                    onClick={copyPost}
                  >
                    <Clipboard size={16} aria-hidden="true" />
                    {copied ? "Copied" : "Copy X report"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  Reports will appear here once residents post issues.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserRoundCheck className="text-emerald-700" size={18} />
                <h2 className="font-black">Leader Scoreboard</h2>
              </div>

              <div className="grid gap-3">
                {sampleLeaders.map((leader) => {
                  const rating = getLeaderRating(leader);

                  return (
                  <button
                    className="rounded-2xl border border-stone-100 bg-stone-50 p-3 text-left transition hover:bg-stone-100"
                    key={leader.id}
                    type="button"
                    onClick={() => setSelectedLeader(leader)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-stone-950">
                          {leader.name}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {leader.role} / {leader.area}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-emerald-800">
                        {rating.score ?? "N/A"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-stone-600">
                      {getRatingLabel(rating.score)}
                    </p>
                  </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="text-emerald-700" size={18} />
                <h2 className="font-black">What's happening in Mtaani</h2>
              </div>
              <div className="grid gap-2">
                {topCategories.map((item) => (
                  <div
                    className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm"
                    key={item.category}
                  >
                    <span className="font-bold text-stone-700">
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="font-black text-stone-950">{item.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <TrustSafetyCard />
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-stone-200 bg-white px-2 py-2 lg:hidden">
        {[
          [Home, "Home", "home"],
          [Compass, "Explore", "explore"],
          [Trophy, "Leaders", "leaderboard"],
          [Bell, "New", "whatsNew"],
          [LayoutDashboard, "Dash", "dashboard"],
        ].map(([Icon, label, view]) => (
          <button
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-bold ${
              activeView === view ? "text-emerald-800" : "text-stone-700"
            }`}
            type="button"
            key={label}
            onClick={() => navigate(view)}
          >
            <Icon size={19} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      {selectedLeader && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-stone-950/40 px-3 py-6 sm:items-center">
          <section className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Community accountability estimate
                </p>
                <h2 className="mt-1 text-xl font-black text-stone-950">
                  {selectedLeader.name}
                </h2>
                <p className="text-sm text-stone-500">
                  {selectedLeader.role} / {selectedLeader.area}
                </p>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100"
                type="button"
                onClick={() => setSelectedLeader(null)}
                aria-label="Close leader detail"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {(() => {
              const rating = getLeaderRating(selectedLeader);

              return (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-stone-50 p-3">
                      <p className="text-xs font-bold text-stone-500">Score</p>
                      <p className="mt-1 text-2xl font-black text-emerald-700">
                        {rating.score ?? "N/A"}
                      </p>
                      <p className="text-xs font-semibold text-stone-600">
                        {getRatingLabel(rating.score)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3">
                      <p className="text-xs font-bold text-stone-500">Resolved</p>
                      <p className="mt-1 text-2xl font-black text-stone-950">
                        {rating.resolved}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3">
                      <p className="text-xs font-bold text-stone-500">Unresolved</p>
                      <p className="mt-1 text-2xl font-black text-stone-950">
                        {rating.unresolved}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-semibold leading-5 text-stone-500">
                    This is a community accountability estimate, not an official
                    government score. It is computed from mock issue status data in
                    this local MVP.
                  </p>

                  <div className="mt-4 grid gap-3">
                    {rating.issues.map((issue) => (
                      <article
                        className="rounded-2xl border border-stone-200 p-3"
                        key={issue.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-stone-950">
                              {issue.title}
                            </h3>
                            <p className="text-xs font-semibold text-stone-500">
                              {issue.ward} / {issue.constituency} /{" "}
                              {getCategoryLabel(issue.category)}
                            </p>
                          </div>
                          <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-black capitalize text-stone-700">
                            {issue.accountabilityStatus}
                          </span>
                        </div>
                      </article>
                    ))}

                    {rating.issues.length === 0 && (
                      <p className="rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-500">
                        No related public issues yet.
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </section>
        </div>
      )}

      {postOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-stone-950/40 px-3 py-6 sm:items-center">
          <section className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-auto rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Post anonymously</h2>
                <p className="text-sm text-stone-500">
                  Share a specific civic issue from your area.
                </p>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100"
                type="button"
                onClick={() => setPostOpen(false)}
                aria-label="Close post modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <ReportForm
              form={form}
              onChange={updateForm}
              onMediaChange={updateMedia}
              onSubmit={submitReport}
            />
          </section>
        </div>
      )}
    </main>
  );
}
