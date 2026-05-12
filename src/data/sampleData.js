export const categories = [
  { value: "roads", label: "Roads" },
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "security", label: "Security" },
  { value: "waste", label: "Waste" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

export const sampleReports = [
  {
    id: "seed-1",
    title: "Flooded access road near stage",
    category: "roads",
    ward: "Zimmerman",
    constituency: "Roysambu",
    location: "Kamiti Road stage",
    description:
      "Rain water has opened a deep pothole and matatus are swerving into pedestrians.",
    createdAt: "2026-05-09T08:30:00.000Z",
  },
  {
    id: "seed-2",
    title: "No water for four days",
    category: "water",
    ward: "Zimmerman",
    constituency: "Roysambu",
    location: "Mirema Drive",
    description:
      "Several flats have had dry taps since Friday with no notice from the water office.",
    createdAt: "2026-05-10T10:15:00.000Z",
  },
  {
    id: "seed-3",
    title: "Streetlights off at bus stop",
    category: "security",
    ward: "Zimmerman",
    constituency: "Roysambu",
    location: "Base stage",
    description:
      "The dark bus stop has become unsafe for people coming home after 8pm.",
    createdAt: "2026-05-10T18:40:00.000Z",
  },
  {
    id: "seed-4",
    title: "Garbage pile blocking drainage",
    category: "waste",
    ward: "Kilimani",
    constituency: "Dagoretti North",
    location: "Kindaruma Road",
    description:
      "Uncollected waste has blocked drainage and the smell is affecting nearby kiosks.",
    createdAt: "2026-05-11T07:05:00.000Z",
  },
  {
    id: "seed-5",
    title: "Clinic queue has no nurse on duty",
    category: "health",
    ward: "Kilimani",
    constituency: "Dagoretti North",
    location: "Community dispensary",
    description:
      "Patients were asked to return tomorrow even though the facility opened on time.",
    createdAt: "2026-05-11T11:20:00.000Z",
  },
  {
    id: "seed-6",
    title: "Transformer sparks during rain",
    category: "electricity",
    ward: "Mwiki",
    constituency: "Kasarani",
    location: "Njiru junction",
    description:
      "The transformer sparks during rain and nearby homes lose power repeatedly.",
    createdAt: "2026-05-12T06:50:00.000Z",
  },
];

export const sampleLeaders = [
  {
    id: "leader-1",
    name: "Hon. Amina Otieno",
    role: "MCA",
    area: "Zimmerman Ward",
    score: 64,
    pendingIssues: 3,
  },
  {
    id: "leader-2",
    name: "Hon. Brian Mwangi",
    role: "MP",
    area: "Roysambu Constituency",
    score: 58,
    pendingIssues: 4,
  },
  {
    id: "leader-3",
    name: "Hon. Grace Wanjiku",
    role: "MCA",
    area: "Kilimani Ward",
    score: 72,
    pendingIssues: 2,
  },
  {
    id: "leader-4",
    name: "Hon. Daniel Kariuki",
    role: "MP",
    area: "Kasarani Constituency",
    score: 61,
    pendingIssues: 1,
  },
];
