import { Category } from "@/types/game";
import { passages } from "@/data/passages";

// ─── HALLUCINATION HUNTER CURRICULUM ───
// Categories derived from actual passages in passages.ts.
// Each level groups passages by difficulty within a category.

export const categories: Category[] = [
  {
    id: "obvious-fabrications",
    title: "Obvious Fabrications",
    description: "Fake citations, invented statistics, and confidently wrong attributions. The AI equivalent of a forged passport.",
    icon: "!!",
    levels: [
      {
        id: 1,
        name: "Rookie Cases",
        items: passages
          .filter((p) => p.category === "obvious-fabrications" && p.difficulty === "easy")
          .map((p) => p.id),
        requiredXp: 0,
        gameMode: "standard",
      },
      {
        id: 2,
        name: "Seasoned Cases",
        items: passages
          .filter((p) => p.category === "obvious-fabrications" && p.difficulty === "medium")
          .map((p) => p.id),
        requiredXp: 50,
        gameMode: "standard",
      },
      {
        id: 3,
        name: "Expert Cases",
        items: passages
          .filter((p) => p.category === "obvious-fabrications" && p.difficulty === "hard")
          .map((p) => p.id),
        requiredXp: 150,
        gameMode: "standard",
      },
    ],
  },
  {
    id: "plausible-but-wrong",
    title: "Plausible But Wrong",
    description: "Subtly incorrect claims wrapped in truth. These pass the gut check but fail the fact check.",
    icon: "?!",
    levels: [
      {
        id: 1,
        name: "Rookie Cases",
        items: passages
          .filter((p) => p.category === "plausible-but-wrong" && p.difficulty === "easy")
          .map((p) => p.id),
        requiredXp: 0,
        gameMode: "standard",
      },
      {
        id: 2,
        name: "Seasoned Cases",
        items: passages
          .filter((p) => p.category === "plausible-but-wrong" && p.difficulty === "medium")
          .map((p) => p.id),
        requiredXp: 100,
        gameMode: "standard",
      },
      {
        id: 3,
        name: "Expert Cases",
        items: passages
          .filter((p) => p.category === "plausible-but-wrong" && p.difficulty === "hard")
          .map((p) => p.id),
        requiredXp: 200,
        gameMode: "standard",
      },
    ],
  },
];

// Helper: get passages by category
export function getItemsByCategory(categoryId: string): string[] {
  return passages.filter((p) => p.category === categoryId).map((p) => p.id);
}

// Helper: get passage IDs by level
export function getItemsByLevel(categoryId: string, levelId: number): string[] {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return [];
  const level = category.levels.find((l) => l.id === levelId);
  if (!level) return [];
  return level.items;
}
