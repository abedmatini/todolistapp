import { useState } from "react";
import { TouchableOpacity, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ReminderSetting {
  priority: string;
  minutesBefore: number;
}

interface CategorySetting {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function SettingsScreen() {
  const [reminderSettings, setReminderSettings] = useState<ReminderSetting[]>([
    { priority: "Urgent", minutesBefore: 15 },
    { priority: "High", minutesBefore: 10 },
    { priority: "Medium", minutesBefore: 5 },
    { priority: "Low", minutesBefore: 5 },
  ]);

  const [categories, setCategories] = useState<CategorySetting[]>([
    { id: "1", name: "Work", icon: "briefcase", color: "bg-blue-500" },
    { id: "2", name: "Personal", icon: "person", color: "bg-purple-500" },
    { id: "3", name: "Shopping", icon: "cart", color: "bg-green-500" },
    { id: "4", name: "Health", icon: "fitness", color: "bg-red-500" },
    { id: "5", name: "Study", icon: "book", color: "bg-yellow-500" },
  ]);

  const textColor = useThemeColor({}, "text");

  const updateReminderTime = (priority: string, minutes: number) => {
    setReminderSettings(
      reminderSettings.map((setting) =>
        setting.priority === priority
          ? { ...setting, minutesBefore: minutes }
          : setting
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-xl font-semibold text-center">
            Settings
          </ThemedText>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Reminder Settings Section */}
          <ThemedView className="mb-6">
            <ThemedText className="text-lg font-semibold mb-3">
              Reminder Settings
            </ThemedText>
            {reminderSettings.map((setting) => (
              <ThemedView
                key={setting.priority}
                className="flex-row justify-between items-center mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <View className="flex-row items-center">
                  <ThemedText className="text-base">
                    {setting.priority}
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <ThemedText className="mr-2">
                    {setting.minutesBefore} min before
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() =>
                      updateReminderTime(
                        setting.priority,
                        setting.minutesBefore + 5
                      )
                    }
                    className="ml-2"
                  >
                    <Ionicons name="add-circle" size={24} color={textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      updateReminderTime(
                        setting.priority,
                        Math.max(5, setting.minutesBefore - 5)
                      )
                    }
                    className="ml-2"
                  >
                    <Ionicons
                      name="remove-circle"
                      size={24}
                      color={textColor}
                    />
                  </TouchableOpacity>
                </View>
              </ThemedView>
            ))}
          </ThemedView>

          {/* Categories Section */}
          <ThemedView className="mb-6">
            <ThemedText className="text-lg font-semibold mb-3">
              Categories
            </ThemedText>
            {categories.map((category) => (
              <ThemedView
                key={category.id}
                className="flex-row justify-between items-center mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-8 h-8 ${category.color} rounded-full items-center justify-center mr-3`}
                  >
                    <Ionicons name={category.icon} size={16} color="white" />
                  </View>
                  <ThemedText className="text-base">{category.name}</ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => deleteCategory(category.id)}
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </ThemedView>
            ))}

            {/* Add Category Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center p-3 bg-blue-500 rounded-lg mt-2"
              onPress={() => {
                // Add category functionality to be implemented
                console.log("Add category");
              }}
            >
              <Ionicons name="add" size={24} color="white" />
              <ThemedText className="text-white ml-2">Add Category</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
