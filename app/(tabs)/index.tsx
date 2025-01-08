import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "tabIconDefault");
  const backgroundColor = useThemeColor({}, "background");

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
      },
    ]);
    setNewTodo("");
    setSelectedDate(undefined);
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

  const renderCalendar = () => (
    <Modal
      visible={showCalendar}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCalendar(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50"
        onPress={() => setShowCalendar(false)}
      >
        <View className="mt-32 mx-4 bg-white rounded-xl overflow-hidden">
          <View className="p-4">
            {/* Calendar days grid */}
            <View className="flex-row flex-wrap">
              {Array.from({ length: 31 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setSelectedDate(date);
                      setShowCalendar(false);
                    }}
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
                          : ""
                      }`}
                    >
                      {format(date, "d")}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
      <TouchableOpacity className="flex-1" onPress={() => toggleTodo(item.id)}>
        <ThemedText
          className={`text-base ${
            item.completed ? "line-through opacity-60" : ""
          }`}
        >
          {item.text}
        </ThemedText>
        {item.dueDate && (
          <ThemedText className="text-sm text-gray-500 mt-1">
            {format(item.dueDate, "MMM d, yyyy")}
          </ThemedText>
        )}
      </TouchableOpacity>
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
