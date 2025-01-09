import { Slot } from "expo-router";
import { CategoryProvider } from "@/context/CategoryContext";

// Import your global CSS file
import "../global.css";

export default function RootLayout() {
  return (
    <CategoryProvider>
      <Slot />
    </CategoryProvider>
  );
}
