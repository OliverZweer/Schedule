import type { Category, CategoryId } from "./types";

export const CATEGORIES: Category[] = [
  { id: "study", label: "学习", color: "#5b6ee1", soft: "#edefff" },
  { id: "work", label: "工作", color: "#2f8f83", soft: "#e4f3ef" },
  { id: "life", label: "生活", color: "#c28a2e", soft: "#faf0dd" },
  { id: "meeting", label: "会议", color: "#c2556b", soft: "#f9e9ec" },
  { id: "other", label: "其他", color: "#6b7280", soft: "#eef0f2" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, Category>;

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id);

export function categoryOf(id: CategoryId): Category {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.other;
}

export function eventColor(event: {
  color?: string;
  category: CategoryId;
}): string {
  return event.color || categoryOf(event.category).color;
}

export function eventSoftColor(event: {
  color?: string;
  category: CategoryId;
}): string {
  return event.color || categoryOf(event.category).soft;
}
