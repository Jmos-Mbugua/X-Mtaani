import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Clipboard,
  Compass,
  Home,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Send,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { categories, sampleLeaders } from "./data/sampleData";
import {
  addReport,
  filterReports,
  generateStatusPost,
  getCategoryLabel,
  getFilterOptions,
  getPriorityClusters,
  getReports,
} from "./services/issueService";

const initialForm = {
  title: "",
  category: "roads",
  ward: "",
  constituency: "",
  location: "",
  description: "",
};

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const compactSelectClass =
  "min-w-0 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

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

function SidebarItem({ icon: Icon, label, active = false }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-full px-3 py-2 text-left text-sm font-bold transition ${
        active
          ? "bg-emerald-50 text-emerald-800"
          : "text-stone-800 hover:bg-stone-100"
      }`}
      type="button"
    >
      <Icon size={20} aria-hidden="true" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function ReportForm({ form, onChange, onSubmit }) {
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

export default function App() {
  const [reports, setReports] = useState(() => getReports());
  const [filters, setFilters] = useState({
    ward: "",
    constituency: "",
    category: "",
  });
  const [form, setForm] = useState(initialForm);
  const [copied, setCopied] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);

  const filterOptions = useMemo(() => getFilterOptions(reports), [reports]);
  const filteredReports = useMemo(
    () => filterReports(reports, filters),
    [reports, filters],
  );
  const clusters = useMemo(() => getPriorityClusters(reports), [reports]);
  const topCluster = clusters[0];
  const statusPost = useMemo(() => generateStatusPost(topCluster), [topCluster]);

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
    { label: "Reports", value: reports.length },
    { label: "Wards", value: filterOptions.wards.length },
    { label: "Clusters", value: clusters.length },
    { label: "X Report", value: topCluster ? "Ready" : "Empty" },
  ];

  const updateForm = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const updateFilter = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitReport = (event) => {
    event.preventDefault();

    const cleaned = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    );

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
    setForm(initialForm);
    setPostOpen(false);
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
            <SidebarItem icon={Home} label="Home / Mtaani" active />
            <SidebarItem icon={Compass} label="Explore" />
            <SidebarItem icon={Trophy} label="Leaderboard" />
            <SidebarItem icon={Bell} label="What's New" />

            <button
              className="flex w-full items-center justify-between rounded-full px-3 py-2 text-left text-sm font-bold text-stone-800 transition hover:bg-stone-100"
              type="button"
              onClick={() => setDashboardOpen((current) => !current)}
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
                  <div
                    className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 text-xs"
                    key={item.label}
                  >
                    <span className="hidden font-semibold text-stone-500 xl:inline">
                      {item.label}
                    </span>
                    <span className="font-black text-stone-900">{item.value}</span>
                  </div>
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
        </aside>

        <section className="min-w-0 border-r border-stone-200">
          <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black tracking-tight">Mtaani</h1>
                <p className="text-sm text-stone-500">
                  Anonymous civic reports from your area
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white lg:hidden"
                type="button"
                onClick={() => setPostOpen(true)}
              >
                <Send size={16} aria-hidden="true" />
                Post
              </button>
            </div>

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
          </header>

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
          </div>

          <div>
            {filteredReports.map((report) => (
              <article
                className="border-b border-stone-200 px-4 py-4 transition hover:bg-stone-50"
                key={report.id}
              >
                <div className="flex gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                    <Users size={18} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className="font-black text-stone-950">Anonymous</span>
                      <span className="text-stone-400">@mtaani</span>
                      <span className="text-stone-400">.</span>
                      <span className="text-stone-500">
                        {formatReportDate(report.createdAt)}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-800">
                        {getCategoryLabel(report.category)}
                      </span>
                    </div>
                    <h2 className="mt-1 text-base font-black leading-snug text-stone-950">
                      {report.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-stone-700">
                      {report.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
                      <MapPin size={14} aria-hidden="true" />
                      <span>{report.ward}</span>
                      <span>/</span>
                      <span>{report.constituency}</span>
                      <span>/</span>
                      <span>{report.location}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filteredReports.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="font-black text-stone-950">No reports found</p>
                <p className="mt-1 text-sm text-stone-500">
                  Try clearing a filter or post the first report for this area.
                </p>
              </div>
            )}
          </div>
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
                {sampleLeaders.map((leader) => (
                  <div
                    className="rounded-2xl border border-stone-100 bg-stone-50 p-3"
                    key={leader.id}
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
                        {leader.score}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-stone-600">
                      Pending issues: {leader.pendingIssues}
                    </p>
                  </div>
                ))}
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
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-stone-200 bg-white px-2 py-2 lg:hidden">
        {[
          [Home, "Home"],
          [Compass, "Explore"],
          [Trophy, "Leaders"],
          [Bell, "New"],
          [LayoutDashboard, "Dash"],
        ].map(([Icon, label]) => (
          <button
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-bold text-stone-700"
            type="button"
            key={label}
          >
            <Icon size={19} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

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
            <ReportForm form={form} onChange={updateForm} onSubmit={submitReport} />
          </section>
        </div>
      )}
    </main>
  );
}
