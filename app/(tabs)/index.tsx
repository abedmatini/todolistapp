import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  dueTime?: string;
  isUrgent?: boolean;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [dueTime, setDueTime] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "tabIconDefault");
  const backgroundColor = useThemeColor({}, "background");

  const categories: Category[] = [
    { id: "1", name: "Work", icon: "briefcase", color: "bg-blue-500" },
    { id: "2", name: "Personal", icon: "person", color: "bg-purple-500" },
    { id: "3", name: "Shopping", icon: "cart", color: "bg-green-500" },
    { id: "4", name: "Health", icon: "fitness", color: "bg-red-500" },
    { id: "5", name: "Study", icon: "book", color: "bg-yellow-500" },
  ];

  // Sort todos with completed items at the bottom
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === "") return;

    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        dueDate: selectedDate,
        dueTime,
        isUrgent,
        category: selectedCategory,
      },
    ]);
    setNewTodo("");
    setSelectedDate(undefined);
    setDueTime("");
    setIsUrgent(false);
    setSelectedCategory("");
    setShowCalendar(false);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const onTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDueTime(format(selectedTime, "HH:mm"));
    }
  };

  const renderCalendar = () => (
    <Modal
      visible={showCalendar}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
          <ScrollView className="p-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-xl font-semibold dark:text-white">
                Set Task Details
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Due Date Section */}
            <ThemedText className="text-base font-semibold mb-2 dark:text-white">
              Due Date
            </ThemedText>
            <View className="flex-row flex-wrap mb-6">
              {Array.from({ length: 31 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDate(date)}
                    className={`w-[14.28%] p-2 items-center ${
                      selectedDate &&
                      selectedDate.toDateString() === date.toDateString()
                        ? "bg-blue-500 rounded-full"
                        : ""
                    }`}
                  >
                    <ThemedText
                      className={`${
                        selectedDate &&
                        selectedDate.toDateString() === date.toDateString()
                          ? "text-white"
                          : "dark:text-white"
                      }`}
                    >
                      {format(date, "d")}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Picker */}
            <ThemedText className="text-base font-semibold mb-2 dark:text-white">
              Time
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-3 mb-6 justify-center"
            >
              <ThemedText className="text-base dark:text-white">
                {dueTime || "Select time"}
              </ThemedText>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={dueTime ? new Date(`2000-01-01T${dueTime}`) : new Date()}
                mode="time"
                is24Hour={true}
                onChange={onTimeChange}
              />
            )}

            {/* Urgent Checkbox */}
            <TouchableOpacity
              className="flex-row items-center mb-6"
              onPress={() => setIsUrgent(!isUrgent)}
            >
              <View
                className={`w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 mr-2 items-center justify-center ${
                  isUrgent ? "bg-red-500 border-red-500" : ""
                }`}
              >
                {isUrgent && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <ThemedText className="text-base dark:text-white">
                Mark as Urgent
              </ThemedText>
            </TouchableOpacity>

            {/* Categories */}
            <ThemedText className="text-base font-semibold mb-2 dark:text-white">
              Category
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`mr-4 p-3 rounded-lg ${category.color} ${
                    selectedCategory === category.id
                      ? "border-2 border-white dark:border-gray-300"
                      : ""
                  }`}
                >
                  <View className="items-center">
                    <Ionicons name={category.icon} size={24} color="white" />
                    <ThemedText className="text-white mt-1">
                      {category.name}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
              onPress={() => {
                addTodo();
                setShowCalendar(false);
              }}
              className="bg-blue-500 p-4 rounded-lg mb-4"
            >
              <ThemedText className="text-white text-center font-semibold text-lg">
                Add Task
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <ThemedView
      className={`flex-row items-center p-3 rounded-lg mb-2 ${
        item.completed ? "bg-green-50/10" : ""
      }`}
      style={{ backgroundColor }}
    >
      <TouchableOpacity
        className="mr-3 justify-center"
        onPress={() => toggleTodo(item.id)}
      >
        {item.completed ? (
          <Ionicons name="checkbox" size={24} color="#4CAF50" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#666" />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <TouchableOpacity onPress={() => toggleTodo(item.id)}>
          <ThemedText
            className={`text-base ${
              item.completed ? "line-through opacity-60" : ""
            }`}
          >
            {item.text}
          </ThemedText>
        </TouchableOpacity>
        <View className="flex-row items-center mt-1">
          {item.category && (
            <View
              className={`px-2 py-1 rounded-full mr-2 ${
                categories.find((c) => c.id === item.category)?.color
              }`}
            >
              <ThemedText className="text-xs text-white">
                {categories.find((c) => c.id === item.category)?.name}
              </ThemedText>
            </View>
          )}
          {item.isUrgent && (
            <View className="px-2 py-1 rounded-full bg-red-500 mr-2">
              <ThemedText className="text-xs text-white">Urgent</ThemedText>
            </View>
          )}
          {(item.dueDate || item.dueTime) && (
            <ThemedText className="text-xs text-gray-500">
              {item.dueDate && format(item.dueDate, "MMM d")}
              {item.dueTime && ` at ${item.dueTime}`}
            </ThemedText>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        className="w-8 h-8 justify-center items-center"
      >
        <ThemedText className="text-red-500 text-2xl font-bold">×</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 p-5">
        <ThemedText type="title" className="mb-5 text-center">
          Todo List
        </ThemedText>

        <ThemedView className="mb-5">
          <ThemedView className="flex-row">
            <TextInput
              className="flex-1 h-12 border border-gray-300 rounded-lg px-3 mr-2 text-base"
              style={{ color: textColor }}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder="Add a new task..."
              placeholderTextColor={placeholderColor}
              onSubmitEditing={addTodo}
              onFocus={() => setShowCalendar(true)}
            />
            <TouchableOpacity
              onPress={addTodo}
              className="w-12 h-12 bg-[#0a7ea4] rounded-lg justify-center items-center"
            >
              <ThemedText className="text-white text-2xl font-bold">
                +
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
          {selectedDate && (
            <ThemedView className="mt-2 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color={textColor} />
              <ThemedText className="ml-2 text-sm">
                Due: {format(selectedDate, "MMM d, yyyy")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setSelectedDate(undefined)}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={16} color={textColor} />
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>

        <FlatList
          className="flex-1"
          data={sortedTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem}
        />

        {renderCalendar()}
      </ThemedView>
    </SafeAreaView>
  );
}
