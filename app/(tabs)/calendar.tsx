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
import { useCategories } from "@/context/CategoryContext";
import { Dimensions } from "react-native";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const textColor = useThemeColor({}, "text");
  const { categories } = useCategories();
  const { height } = Dimensions.get("window");
  const buttonHeight = height * 0.05;

  // Sample todos (replace with your actual todos state/context)
  const [todos] = useState<Todo[]>([
    {
      id: "1",
      text: "Meeting with team",
      completed: false,
      dueDate: new Date(),
      category: "1", // Work category
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
      (todo) =>
        todo.dueDate &&
        isSameDay(todo.dueDate, date) &&
        (selectedCategory ? todo.category === selectedCategory : true)
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 p-5">
        <ThemedText type="title" className="text-center mb-2">
          Calendar
        </ThemedText>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mb-2"
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={{
              height: buttonHeight,
            }}
            className={`mr-2 px-4 rounded-full border items-center justify-center ${
              selectedCategory === null
                ? "bg-blue-500 border-blue-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <ThemedText
              className={selectedCategory === null ? "text-white" : ""}
            >
              All
            </ThemedText>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={{
                height: buttonHeight,
              }}
              className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                selectedCategory === category.id ? category.color : ""
              } border ${
                selectedCategory === category.id
                  ? `border-${category.color}`
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? "white" : textColor}
                className="mr-2"
              />
              <ThemedText
                className={selectedCategory === category.id ? "text-white" : ""}
              >
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Month Navigation */}
        <View className="flex-row justify-between items-center mb-1">
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
        <View className="flex-row mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <View key={day} className="flex-1 items-center">
              <ThemedText className="text-sm font-medium">{day}</ThemedText>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap mb-4">
          {getDaysInMonth(currentMonth).map((date, index) => {
            const tasks = getTasksForDate(date);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(date)}
                className="w-[14.28%] aspect-square p-1"
              >
                <View
                  className={`flex-1 rounded-lg p-1 ${
                    isSelected
                      ? "bg-blue-500"
                      : isToday
                      ? "bg-blue-200 dark:bg-blue-800"
                      : isCurrentMonth
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <ThemedText
                    className={`text-center ${
                      isSelected || isToday ? "text-white" : ""
                    } ${!isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    {format(date, "d")}
                  </ThemedText>

                  {tasks.length > 0 && (
                    <View className="mt-1">
                      {tasks.slice(0, 2).map((task) => (
                        <View
                          key={task.id}
                          className="bg-blue-200/50 dark:bg-blue-800/50 rounded-full px-1 mb-1"
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
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Tasks */}
        {selectedDate && (
          <ScrollView
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-4"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText className="text-lg font-semibold mb-3">
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </ThemedText>

            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map((task) => (
                <View
                  key={task.id}
                  className="flex-row items-center bg-white dark:bg-gray-700 p-3 rounded-lg mb-2"
                >
                  <View className="flex-1">
                    <ThemedText className="font-medium">{task.text}</ThemedText>
                    <View className="flex-row items-center mt-1">
                      {task.category && (
                        <View
                          className={`px-2 py-1 rounded-full mr-2 ${
                            categories.find((c) => c.id === task.category)
                              ?.color || "bg-gray-500"
                          }`}
                        >
                          <ThemedText className="text-white text-xs">
                            {
                              categories.find((c) => c.id === task.category)
                                ?.name
                            }
                          </ThemedText>
                        </View>
                      )}
                      {task.priority && (
                        <ThemedText className="text-xs opacity-60">
                          {task.priority} Priority
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity className="p-2">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color={textColor}
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <ThemedText className="text-center opacity-60">
                No tasks for this day
              </ThemedText>
            )}
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
