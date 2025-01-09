import { createContext, useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export interface CategorySetting {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface CategoryContextType {
  categories: CategorySetting[];
  setCategories: (categories: CategorySetting[]) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<CategorySetting[]>([
    { id: "1", name: "Work", icon: "briefcase", color: "bg-blue-500" },
    { id: "2", name: "Personal", icon: "person", color: "bg-purple-500" },
    { id: "3", name: "Shopping", icon: "cart", color: "bg-green-500" },
    { id: "4", name: "Health", icon: "fitness", color: "bg-red-500" },
    { id: "5", name: "Study", icon: "book", color: "bg-yellow-500" },
  ]);

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
