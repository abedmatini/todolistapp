import { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  priority?: string;
}

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const textColor = useThemeColor({}, "text");

  // Sample todos (replace with your actual todos state/context)
  const [todos] = useState<Todo[]>([
    {
      id: "1",
      text: "Meeting with team",
      completed: false,
      dueDate: new Date(),
      category: "Work",
      priority: "High",
    },
    // Add more sample todos...
  ]);

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getTasksForDate = (date: Date) => {
    return todos.filter(
      (todo) => todo.dueDate && isSameDay(todo.dueDate, date)
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 p-5">
        <ThemedText type="title" className="text-center mb-5">
          Calendar
        </ThemedText>

        {/* Month Navigation */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2"
          >
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </ThemedText>
          <TouchableOpacity
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2"
          >
            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View className="flex-row mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <View key={day} className="flex-1 items-center">
              <ThemedText className="text-sm font-medium">{day}</ThemedText>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap">
            {getDaysInMonth(currentMonth).map((date, index) => {
              const tasks = getTasksForDate(date);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentMonth);

              return (
                <View key={index} className="w-[14.28%] aspect-square p-1">
                  <View
                    className={`flex-1 rounded-lg p-1 ${
                      isToday
                        ? "bg-blue-500"
                        : isCurrentMonth
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    }`}
                  >
                    <ThemedText
                      className={`text-center ${isToday ? "text-white" : ""} ${
                        !isCurrentMonth ? "opacity-40" : ""
                      }`}
                    >
                      {format(date, "d")}
                    </ThemedText>

                    {tasks.length > 0 && (
                      <View className="mt-1">
                        {tasks.slice(0, 2).map((task) => (
                          <View
                            key={task.id}
                            className="bg-blue-200 dark:bg-blue-800 rounded-full px-1 mb-1"
                          >
                            <ThemedText
                              className="text-[10px] text-center"
                              numberOfLines={1}
                            >
                              {task.text}
                            </ThemedText>
                          </View>
                        ))}
                        {tasks.length > 2 && (
                          <ThemedText className="text-[10px] text-center">
                            +{tasks.length - 2}
                          </ThemedText>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
