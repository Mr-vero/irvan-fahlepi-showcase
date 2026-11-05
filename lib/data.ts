export type Family = "floral" | "woody" | "citrus" | "amber";

export const FAMILIES: Family[] = ["floral", "woody", "citrus", "amber"];

export type Fragrance = {
  family: Family;
  name: string;
  tagline: string;
  description: string;
  notes: { top: string; heart: string; base: string };
  colors: [string, string];
};

export const FRAGRANCES: Record<Family, Fragrance> = {
  floral: {
    family: "floral",
    name: "Rose Nocturne",
    tagline: "A garden after dark",
    description:
      "Romantic but never sweet. Damask rose opens in cool night air, softened by peony and a trail of white musk.",
    notes: { top: "Pink pepper", heart: "Damask rose · Peony", base: "White musk" },
    colors: ["#3b1a24", "#b4566b"],
  },
  woody: {
    family: "woody",
    name: "Cèdre Silencieux",
    tagline: "The quiet of old libraries",
    description:
      "Composed and deep. Atlas cedar and smoky vetiver rest on creamy sandalwood, lifted by a breath of bergamot.",
    notes: { top: "Bergamot", heart: "Atlas cedar · Vetiver", base: "Sandalwood" },
    colors: ["#1d2118", "#6b7351"],
  },
  citrus: {
    family: "citrus",
    name: "Lumière d'Été",
    tagline: "Light on the Riviera",
    description:
      "Bright and effortless. Sicilian lemon and neroli sparkle over orange blossom, settling into sun-warmed skin.",
    notes: { top: "Sicilian lemon", heart: "Neroli · Orange blossom", base: "Ambrette" },
    colors: ["#2a2414", "#c9a24a"],
  },
  amber: {
    family: "amber",
    name: "Ambre Minuit",
    tagline: "Candlelight and velvet",
    description:
      "Warm and magnetic. Saffron glows over labdanum and amber, wrapped in Madagascan vanilla and tonka.",
    notes: { top: "Saffron", heart: "Amber · Labdanum", base: "Vanilla · Tonka" },
    colors: ["#2a140c", "#a2532a"],
  },
};

export type Question = {
  prompt: string;
  options: { label: string; family: Family }[];
};

export const QUESTIONS: Question[] = [
  {
    prompt: "Your ideal evening begins…",
    options: [
      { label: "In a rooftop garden at dusk", family: "floral" },
      { label: "Beside a fire in a quiet library", family: "woody" },
      { label: "On a terrace above the sea", family: "citrus" },
      { label: "In a candlelit jazz bar", family: "amber" },
    ],
  },
  {
    prompt: "Choose a texture",
    options: [
      { label: "Silk", family: "floral" },
      { label: "Polished oak", family: "woody" },
      { label: "Cool linen", family: "citrus" },
      { label: "Velvet", family: "amber" },
    ],
  },
  {
    prompt: "A city to disappear into",
    options: [
      { label: "Paris in spring", family: "floral" },
      { label: "Kyoto in autumn", family: "woody" },
      { label: "Amalfi in July", family: "citrus" },
      { label: "Marrakech at night", family: "amber" },
    ],
  },
  {
    prompt: "The hour you feel most yourself",
    options: [
      { label: "Golden afternoon", family: "floral" },
      { label: "Twilight", family: "woody" },
      { label: "First light", family: "citrus" },
      { label: "Past midnight", family: "amber" },
    ],
  },
  {
    prompt: "A gift you would treasure",
    options: [
      { label: "A hand-tied bouquet", family: "floral" },
      { label: "A leather-bound journal", family: "woody" },
      { label: "A weekend by the sea", family: "citrus" },
      { label: "An antique gold ring", family: "amber" },
    ],
  },
];

/** Most-chosen family wins; ties go to the tied family picked most recently. */
export function scoreQuiz(answers: Family[]): Family {
  const counts = new Map<Family, number>();
  for (const f of answers) counts.set(f, (counts.get(f) ?? 0) + 1);
  const max = Math.max(...counts.values());
  for (let i = answers.length - 1; i >= 0; i--) {
    if (counts.get(answers[i]) === max) return answers[i];
  }
  return "floral";
}
