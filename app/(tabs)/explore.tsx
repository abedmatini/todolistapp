import { useState } from "react";
import { TouchableOpacity, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Task {
  id: number;
  project: string;
  title: string;
  time: string;
  status: "done" | "in-progress" | "to-do";
  icon: "design" | "research" | "wireframe" | "sprint";
}

const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    project: "Grocery shopping app design",
    title: "Market Research",
    time: "10:00 AM",
    status: "done",
    icon: "design",
  },
  {
    id: 2,
    project: "Grocery shopping app design",
    title: "Competitive Analysis",
    time: "12:00 PM",
    status: "in-progress",
    icon: "research",
  },
  {
    id: 3,
    project: "Uber Eats redesign challenge",
    title: "Create Low-fidelity Wireframe",
    time: "07:00 PM",
    status: "to-do",
    icon: "wireframe",
  },
  {
    id: 4,
    project: "About design sprint",
    title: "How to pitch a Design Sprint",
    time: "09:00 PM",
    status: "to-do",
    icon: "sprint",
  },
];

export default function TaskList() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<
    "all" | "to-do" | "in-progress" | "completed"
  >("all");
  const [tasks] = useState<Task[]>(INITIAL_TASKS);
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 2 + i);
    return date;
  });

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText className="text-xl font-semibold">
            Today's Tasks
          </ThemedText>
          <TouchableOpacity>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={textColor}
            />
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2"
        >
          {dates.map((date, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(date)}
              className={`items-center p-2 mr-1 rounded-xl h-[60px] min-w-[64px] ${
                date.getDate() === selectedDate.getDate() ? "bg-purple-600" : ""
              }`}
            >
              <ThemedText
                className={`text-xs opacity-60 ${
                  date.getDate() === selectedDate.getDate() ? "text-white" : ""
                }`}
              >
                {format(date, "MMM")}
              </ThemedText>
              <ThemedText
                className={`text-base font-semibold my-0.5 ${
                  date.getDate() === selectedDate.getDate() ? "text-white" : ""
                }`}
              >
                {format(date, "d")}
              </ThemedText>
              <ThemedText
                className={`text-xs opacity-60 ${
                  date.getDate() === selectedDate.getDate() ? "text-white" : ""
                }`}
              >
                {format(date, "EEE")}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2 py-1 mb-1"
        >
          {(["all", "to-do", "in-progress", "completed"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-3 py-1 rounded-full mr-1.5 h-7 justify-center ${
                filter === f ? "bg-purple-600" : ""
              }`}
            >
              <ThemedText
                className={`text-xs ${filter === f ? "text-white" : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tasks */}
        <ScrollView className="flex-1 px-2">
          {tasks.map((task) => (
            <ThemedView
              key={task.id}
              className="p-3 rounded-xl mb-2 border border-gray-200"
            >
              <TouchableOpacity className="absolute top-4 right-4">
                <Ionicons name="trash-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <ThemedText className="text-sm opacity-60 mb-1">
                {task.project}
              </ThemedText>
              <ThemedText className="text-base font-semibold mb-2">
                {task.title}
              </ThemedText>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View
                    className={`w-4 h-4 rounded-full mr-2 ${
                      task.icon === "design"
                        ? "bg-pink-100"
                        : task.icon === "research"
                        ? "bg-purple-100"
                        : task.icon === "wireframe"
                        ? "bg-blue-100"
                        : "bg-orange-100"
                    }`}
                  />
                  <ThemedText className="text-sm opacity-80">
                    {task.time}
                  </ThemedText>
                </View>
                <ThemedText
                  className={`text-sm ${
                    task.status === "done"
                      ? "text-purple-600"
                      : task.status === "in-progress"
                      ? "text-orange-400"
                      : "text-blue-400"
                  }`}
                >
                  {task.status === "done"
                    ? "Done"
                    : task.status === "in-progress"
                    ? "In Progress"
                    : "To-do"}
                </ThemedText>
              </View>
            </ThemedView>
          ))}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => router.push("/new")}
          className="absolute bottom-20 self-center w-14 h-14 rounded-full bg-purple-600 justify-center items-center shadow-lg"
        >
          <ThemedText className="text-white text-2xl font-bold">+</ThemedText>
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <View className="flex-row justify-around items-center p-4 border-t border-gray-200 bg-white">
          <TouchableOpacity>
            <Ionicons name="home" size={24} color="#9333ea" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="list-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
