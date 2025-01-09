import { Text, TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useColorScheme } from "react-native";

interface ThemedTextProps extends TextProps {
  type?: "title" | "body";
  className?: string;
  lightColor?: string;
  darkColor?: string;
}

export function ThemedText({
  className = "",
  type,
  style,
  lightColor,
  darkColor,
  ...props
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const themeColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const baseStyle = type === "title" ? "text-2xl font-bold" : "text-base";

  // Check if text-white class is present
  const hasWhiteText = className.includes("text-white");

  // Use white color only if text-white class is present and we're not in light mode
  const textColor =
    hasWhiteText && colorScheme === "dark" ? "#ffffff" : themeColor;

  return (
    <Text
      className={`${baseStyle} ${className}`}
      style={[{ color: textColor }, style]}
      {...props}
    />
  );
}
