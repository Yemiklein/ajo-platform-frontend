import { Group } from "@/types";

export function getNextDueDate(group: Group): Date | null {
  if (group.status !== "ACTIVE") return null;
  const created = new Date(group.createdAt);
  const now = new Date();

  switch (group.cycleType) {
    case "DAILY": {
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(23, 59, 59, 0);
      return next;
    }
    case "WEEKLY": {
      const target = created.getDay();
      let diff = target - now.getDay();
      if (diff <= 0) diff += 7;
      const next = new Date(now);
      next.setDate(now.getDate() + diff);
      return next;
    }
    case "MONTHLY": {
      const day = created.getDate();
      let next = new Date(now.getFullYear(), now.getMonth(), day);
      if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, day);
      return next;
    }
    default:
      return null;
  }
}

export function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

export function dueBadgeProps(group: Group): { label: string; classes: string } | null {
  const due = getNextDueDate(group);
  if (!due) return null;
  const days = daysUntil(due);

  if (days === 0) return {
    label: "Due today",
    classes: "bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  };
  if (days === 1) return {
    label: "Due tomorrow",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  };
  if (days <= 3) return {
    label: `Due in ${days} days`,
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  };
  return {
    label: `Due in ${days} days`,
    classes: "bg-gray-50 text-gray-500 ring-1 ring-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:ring-zinc-600",
  };
}
