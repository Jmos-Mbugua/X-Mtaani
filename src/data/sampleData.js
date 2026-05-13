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

export const kenyanLocations = [
  ["Nairobi", "Roysambu", ["Zimmerman", "Roysambu", "Kahawa West", "Githurai"], ["Mirema", "TRM Drive", "Kahawa Sukari", "Hunters"]],
  ["Nairobi", "Kasarani", ["Mwiki", "Kasarani", "Clay City", "Njiru"], ["Sunton", "Seasons", "Mwiki Phase 3", "Njiru Junction"]],
  ["Nairobi", "Embakasi", ["Pipeline", "Tassia", "Umoja", "Kayole"], ["Fedha", "Nyayo Estate", "Donholm", "Stage 46"]],
  ["Nairobi", "Westlands", ["Parklands", "Kangemi", "Mountain View", "Kitisuru"], ["Sarit", "Loresho", "Lower Kabete", "Brookside"]],
  ["Nairobi", "Kibra", ["Laini Saba", "Makina", "Woodley", "Sarangombe"], ["Olympic", "Toi Market", "DC Grounds", "Ayany"]],
  ["Nairobi", "Langata", ["South C", "Nairobi West", "Karen", "Mugumo-ini"], ["Madaraka", "Wilson", "Otiende", "T-Mall"]],
  ["Nairobi", "Dagoretti", ["Kilimani", "Kawangware", "Gatina", "Mutuini"], ["Kindaruma", "Yaya", "Lavington", "Riruta"]],
  ["Kiambu", "Thika", ["Township", "Hospital", "Gatuanyaga", "Kamenu"], ["Makongeni", "Section 9", "Landless", "Ngoingwa"]],
  ["Kiambu", "Ruiru", ["Biashara", "Gatongora", "Kahawa Sukari", "Gitothua"], ["Membley", "Eastern Bypass", "Kamakis", "Kwa Kairu"]],
  ["Kiambu", "Juja", ["Juja", "Witeithie", "Murera", "Theta"], ["Highpoint", "Kalimoni", "Gachororo", "Toll Station"]],
  ["Kiambu", "Kikuyu", ["Kikuyu", "Kinoo", "Sigona", "Karai"], ["Ondiri", "Gitaru", "Muthiga", "Zambezi"]],
  ["Mombasa", "Mvita", ["Tudor", "Tononoka", "Majengo", "Old Town"], ["Makadara", "Buxton", "King'orani", "Mwembe Tayari"]],
  ["Mombasa", "Kisauni", ["Bamburi", "Mwakirunge", "Shanzu", "Magogoni"], ["Kiembeni", "Mtopanga", "Vescon", "Fisheries"]],
  ["Mombasa", "Likoni", ["Mtongwe", "Shika Adabu", "Bofu", "Likoni"], ["Shelly Beach", "Timbwani", "Ujamaa", "Jamvi la Wageni"]],
  ["Mombasa", "Nyali", ["Frere Town", "Kongowea", "Kadzandani", "Mkomani"], ["Links Road", "Bombolulu", "V.O.K", "Beach Road"]],
  ["Nakuru", "Nakuru Town East", ["Biashara", "Kivumbini", "Flamingo", "Menengai"], ["Free Area", "Section 58", "Lanet", "Bondeni"]],
  ["Nakuru", "Nakuru Town West", ["Kaptembwa", "London", "Rhoda", "Shabaab"], ["Kapkures", "Ngata", "Kiti", "Milimani"]],
  ["Nakuru", "Naivasha", ["Hellsgate", "Lake View", "Mai Mahiu", "Naivasha East"], ["Karagita", "Kabati", "Kayole", "Mirera"]],
  ["Kisumu", "Kisumu Central", ["Market Milimani", "Nyalenda A", "Railways", "Kondele"], ["Tom Mboya", "Polyview", "Lolwe", "Kibuye"]],
  ["Kisumu", "Kisumu East", ["Kajulu", "Kolwa East", "Manyatta B", "Nyalunya"], ["Mamboleo", "Nyamasaria", "Kibos", "Migosi"]],
  ["Kisumu", "Kisumu West", ["South West Kisumu", "Central Kisumu", "West Kisumu", "Kisumu North"], ["Otonglo", "Ojolla", "Holo", "Maseno"]],
].map(([county, constituency, wards, estates]) => ({
  county,
  constituency,
  wards,
  estates,
}));

export const demoAccounts = [
  { email: "roysambu.demo@xmtaani.local", password: "demo1234", label: "Nairobi / Roysambu" },
  { email: "ruiru.demo@xmtaani.local", password: "demo1234", label: "Kiambu / Ruiru" },
  { email: "nyali.demo@xmtaani.local", password: "demo1234", label: "Mombasa / Nyali" },
];

const anonymousPrefixes = [
  "Mtaani Voice",
  "Anonymous Resident",
  "Neighbourhood Watch",
  "Estate Observer",
  "Civic Witness",
  "Community Signal",
];

const titlesByCategory = {
  roads: ["Blocked drainage on access road", "Potholes slowing emergency access"],
  water: ["Water outage affecting flats", "Burst pipe flooding kiosks"],
  electricity: ["Streetlights off near stage", "Transformer outage during rain"],
  security: ["Unsafe dark footpath", "Increased muggings near bus stop"],
  waste: ["Uncollected garbage blocking drainage", "Illegal dumping near market"],
  health: ["Clinic queue without enough staff", "Dispensary stock-out reported"],
  education: ["Classroom roof leaking", "School crossing needs markings"],
  other: ["Public toilet needs repair", "Market shed damaged by rain"],
};

const descriptionsByCategory = {
  roads: "Residents say the route is unsafe for pedestrians and public service vehicles.",
  water: "Households report repeated interruptions with no clear notice or repair timeline.",
  electricity: "The outage is affecting evening movement and small businesses nearby.",
  security: "Residents are asking for urgent lighting, patrols, and official acknowledgement.",
  waste: "The smell and blocked drainage are affecting nearby homes and kiosks.",
  health: "Patients are waiting longer than usual and asking for a response from facility managers.",
  education: "Parents say learners are being affected and the issue needs quick inspection.",
  other: "Community members want the responsible office to acknowledge and share an action plan.",
};

const verificationStatuses = ["Unverified", "Community Confirmed", "Resolved"];
const issueStatuses = ["unresolved", "pending verification", "resolved"];

const pick = (items, index) => items[index % items.length];

export const buildAnonymousUsername = (index) =>
  `${pick(anonymousPrefixes, index)} ${100 + ((index * 37) % 9900)}`;

export const generateSeedUsers = (count = 220) =>
  Array.from({ length: count }, (_, index) => {
    const demoLocation =
      index === 0
        ? kenyanLocations.find((item) => item.constituency === "Roysambu")
        : index === 1
          ? kenyanLocations.find((item) => item.constituency === "Ruiru")
          : index === 2
            ? kenyanLocations.find((item) => item.constituency === "Nyali")
            : pick(kenyanLocations, index);
    const demo = index < 3 ? demoAccounts[index] : null;

    return {
      id: `seed-user-${String(index + 1).padStart(3, "0")}`,
      email:
        demo?.email ||
        `resident${String(index + 1).padStart(3, "0")}@xmtaani.local`,
      password: demo?.password || "demo1234",
      anonymousUsername: buildAnonymousUsername(index),
      county: demoLocation.county,
      constituency: demoLocation.constituency,
      ward: pick(demoLocation.wards, index),
      estate: pick(demoLocation.estates, index + 1),
      createdAt: "2026-05-01T08:00:00.000Z",
      demo: Boolean(demo),
    };
  });

export const generateSeedReports = (users = generateSeedUsers(), count = 240) =>
  Array.from({ length: count }, (_, index) => {
    const user = pick(users, index);
    const category = pick(categories, index).value;
    const createdAt = new Date(Date.UTC(2026, 4, 12, 7, 0, 0));
    createdAt.setMinutes(createdAt.getMinutes() - index * 43);

    return {
      id: `seed-report-${String(index + 1).padStart(3, "0")}`,
      authorId: user.id,
      authorName: user.anonymousUsername,
      title: pick(titlesByCategory[category], index),
      category,
      county: user.county,
      constituency: user.constituency,
      ward: user.ward,
      location: user.estate,
      description: descriptionsByCategory[category],
      createdAt: createdAt.toISOString(),
      likes: (index * 3) % 41,
      comments: index % 9,
      reposts: (index * 2) % 17,
      verificationStatus: pick(verificationStatuses, index),
      issueStatus: pick(issueStatuses, index + 1),
      archived: false,
      media: null,
    };
  });

const seedUsers = generateSeedUsers();

export const sampleReports = generateSeedReports(seedUsers);

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
