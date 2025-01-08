import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "text-purple-600";
    case "in-progress":
      return "text-orange-400";
    case "to-do":
      return "text-blue-400";
    default:
      return "text-gray-400";
  }
} 