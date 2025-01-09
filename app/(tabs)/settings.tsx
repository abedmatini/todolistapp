import { useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  View,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCategories, CategorySetting } from "@/context/CategoryContext";

interface ReminderSetting {
  priority: string;
  minutesBefore: number;
}

export default function SettingsScreen() {
  const { categories, setCategories } = useCategories();

  const [reminderSettings, setReminderSettings] = useState<ReminderSetting[]>([
    { priority: "Urgent", minutesBefore: 15 },
    { priority: "High", minutesBefore: 10 },
    { priority: "Medium", minutesBefore: 5 },
    { priority: "Low", minutesBefore: 5 },
  ]);

  const textColor = useThemeColor({}, "text");

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] =
    useState<keyof typeof Ionicons.glyphMap>("bookmark");

  const availableIcons: (keyof typeof Ionicons.glyphMap)[] = [
    "bookmark",
    "briefcase",
    "book",
    "cart",
    "fitness",
    "heart",
    "home",
    "person",
    "school",
    "restaurant",
    "airplane",
    "game-controller",
    "musical-notes",
    "car",
    "basketball",
    "laptop",
    "camera",
    "film",
    "gift",
  ];

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

  const addCategory = () => {
    if (newCategoryName.trim() === "") return;

    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setCategories([
      ...categories,
      {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: randomColor,
      },
    ]);

    setNewCategoryName("");
    setSelectedIcon("bookmark");
    setShowAddCategory(false);
  };

  const renderAddCategoryModal = () => (
    <Modal
      visible={showAddCategory}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddCategory(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <ThemedView className="bg-white dark:bg-gray-800 rounded-t-3xl">
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-xl font-semibold">
                Add New Category
              </ThemedText>
              <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <ThemedText className="text-sm font-semibold mb-2">
                Category Name
              </ThemedText>
              <TextInput
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-base"
                style={{ color: textColor }}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Enter category name..."
                placeholderTextColor="#666"
              />
            </View>

            <View className="mb-4">
              <ThemedText className="text-sm font-semibold mb-2">
                Select Icon
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {availableIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    className={`p-3 rounded-lg ${
                      selectedIcon === icon
                        ? "bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <Ionicons
                      name={icon}
                      size={24}
                      color={selectedIcon === icon ? "white" : textColor}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={addCategory}
              className="bg-blue-500 p-3 rounded-lg mt-4"
            >
              <ThemedText className="text-white text-center font-semibold">
                Add Category
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="p-4 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-xl font-semibold text-center">
            Settings
          </ThemedText>
        </View>

        <ScrollView className="flex-1 p-4">
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

            <TouchableOpacity
              className="flex-row items-center justify-center p-3 bg-blue-500 rounded-lg mt-2"
              onPress={() => setShowAddCategory(true)}
            >
              <Ionicons name="add" size={24} color="white" />
              <ThemedText className="text-white ml-2">Add Category</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      {renderAddCategoryModal()}
    </SafeAreaView>
  );
}
