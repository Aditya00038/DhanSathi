export type OccupationType = "student" | "farmer" | "salaried" | "self-employed";
export type SocialCategoryType = "General" | "OBC" | "SC" | "ST" | "Minority";

export type UserSchemeProfile = {
  state: string;
  age: number;
  annualIncome?: number;
  occupation: OccupationType;
  category: SocialCategoryType;
};

export type GovernmentScheme = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  estimatedAnnualBenefitInr: number;
  url: string;
  occupations?: OccupationType[];
  categories?: SocialCategoryType[];
  minAge?: number;
  maxAge?: number;
  maxAnnualIncome?: number;
  states?: string[];
};

export type RecommendedScheme = GovernmentScheme & {
  score: number;
  reason: string;
};

const INDIA_WIDE = "ALL";

const SCHEMES: GovernmentScheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    description: "Income support for eligible farmer families.",
    tags: ["farmer", "income-support", "agriculture"],
    estimatedAnnualBenefitInr: 6000,
    url: "https://pmkisan.gov.in/",
    occupations: ["farmer"],
    states: [INDIA_WIDE],
  },
  {
    id: "pmjjby",
    name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    description: "Affordable life insurance cover through bank account.",
    tags: ["insurance", "savings-protection", "bank"],
    estimatedAnnualBenefitInr: 200000,
    url: "https://jansuraksha.gov.in/",
    minAge: 18,
    maxAge: 50,
    states: [INDIA_WIDE],
  },
  {
    id: "pmsby",
    name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    description: "Low-cost accidental insurance scheme.",
    tags: ["insurance", "accident-cover"],
    estimatedAnnualBenefitInr: 200000,
    url: "https://jansuraksha.gov.in/",
    minAge: 18,
    maxAge: 70,
    states: [INDIA_WIDE],
  },
  {
    id: "apyy",
    name: "Atal Pension Yojana (APY)",
    description: "Pension-focused long-term savings for unorganized workers.",
    tags: ["pension", "retirement", "long-term"],
    estimatedAnnualBenefitInr: 60000,
    url: "https://www.npscra.nsdl.co.in/scheme-details.php",
    minAge: 18,
    maxAge: 40,
    states: [INDIA_WIDE],
  },
  {
    id: "nsp",
    name: "National Scholarship Portal (NSP)",
    description: "Scholarships for students from eligible groups.",
    tags: ["student", "scholarship", "education"],
    estimatedAnnualBenefitInr: 30000,
    url: "https://scholarships.gov.in/",
    occupations: ["student"],
    categories: ["OBC", "SC", "ST", "Minority"],
    states: [INDIA_WIDE],
  },
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi",
    description: "Collateral-free working capital support for street vendors.",
    tags: ["self-employed", "micro-credit", "business"],
    estimatedAnnualBenefitInr: 12000,
    url: "https://pmsvanidhi.mohua.gov.in/",
    occupations: ["self-employed"],
    maxAnnualIncome: 500000,
    states: [INDIA_WIDE],
  },
  {
    id: "mmahb",
    name: "Mukhyamantri Majhi Ladki Bahin Yojana (Maharashtra)",
    description: "Monthly financial aid for eligible women beneficiaries in Maharashtra.",
    tags: ["state-scheme", "women", "cash-support"],
    estimatedAnnualBenefitInr: 18000,
    url: "https://ladakibahin.maharashtra.gov.in/",
    states: ["Maharashtra"],
    maxAnnualIncome: 250000,
  },
  {
    id: "kalia",
    name: "KALIA Yojana (Odisha)",
    description: "Livelihood and income support for farmers in Odisha.",
    tags: ["farmer", "state-scheme", "odisha"],
    estimatedAnnualBenefitInr: 10000,
    url: "https://kalia.odisha.gov.in/",
    occupations: ["farmer"],
    states: ["Odisha"],
  },
  {
    id: "ssy",
    name: "Sukanya Samriddhi Yojana",
    description: "High-interest savings account for girl child education and marriage.",
    tags: ["savings", "girl-child", "long-term"],
    estimatedAnnualBenefitInr: 15000,
    url: "https://www.indiapost.gov.in/Financial/pages/content/sukanya-samriddhi-yojana.aspx",
    states: [INDIA_WIDE],
  },
  {
    id: "pmmvy",
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    description: "Maternity benefit support for eligible women.",
    tags: ["women", "health", "cash-support"],
    estimatedAnnualBenefitInr: 5000,
    url: "https://pmmvy.wcd.gov.in/",
    states: [INDIA_WIDE],
  },
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function isStateEligible(states: string[] | undefined, state: string): boolean {
  if (!states || states.length === 0) return true;
  if (states.includes(INDIA_WIDE)) return true;
  const needle = normalizeText(state);
  return states.some((s) => normalizeText(s) === needle);
}

export function getRecommendedSchemes(profile: UserSchemeProfile, limit = 6): RecommendedScheme[] {
  const recommendations = SCHEMES.map((scheme) => {
    let score = 0;
    const reasons: string[] = [];

    if (isStateEligible(scheme.states, profile.state)) {
      score += 20;
      reasons.push("available in your state");
    } else {
      score -= 100;
    }

    if (!scheme.occupations || scheme.occupations.includes(profile.occupation)) {
      score += 25;
      if (scheme.occupations?.length) reasons.push("matches your occupation");
    } else {
      score -= 40;
    }

    if (!scheme.categories || scheme.categories.includes(profile.category)) {
      score += 18;
      if (scheme.categories?.length) reasons.push("fits your social category");
    } else {
      score -= 25;
    }

    if ((scheme.minAge ?? 0) <= profile.age && (scheme.maxAge ?? 200) >= profile.age) {
      score += 15;
      reasons.push("within your age range");
    } else {
      score -= 30;
    }

    if (typeof profile.annualIncome !== "number") {
      score += 8;
      reasons.push("income not provided (partial match)");
    } else if ((scheme.maxAnnualIncome ?? Number.MAX_SAFE_INTEGER) >= profile.annualIncome) {
      score += 22;
      reasons.push("income appears eligible");
    } else {
      score -= 35;
    }

    return {
      ...scheme,
      score,
      reason: reasons.length > 0 ? reasons.join(", ") : "general recommendation",
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}

export function searchSchemes(items: RecommendedScheme[], query: string): RecommendedScheme[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return items;

  return items.filter((scheme) => {
    const hay = [scheme.name, scheme.description, ...scheme.tags].join(" ").toLowerCase();
    return hay.includes(normalizedQuery);
  });
}