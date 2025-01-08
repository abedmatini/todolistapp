import { StyleSheet } from "react-native";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, FlatList, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

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
      },
    ]);
    setNewTodo("");
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

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <ThemedView
      style={[
        styles.todoItem,
        { backgroundColor },
        item.completed && styles.completedTodoItem,
      ]}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTodo(item.id)}
      >
        {item.completed ? (
          <Ionicons name="checkbox" size={24} color="#4CAF50" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#666" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.todoTextContainer}
        onPress={() => toggleTodo(item.id)}
      >
        <ThemedText
          style={[styles.todoText, item.completed && styles.completedTodoText]}
        >
          {item.text}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        style={styles.deleteButton}
      >
        <ThemedText style={styles.deleteButtonText}>×</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.header}>
          Todo List
        </ThemedText>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={newTodo}
            onChangeText={setNewTodo}
            placeholder="Add a new task..."
            placeholderTextColor={placeholderColor}
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity onPress={addTodo} style={styles.addButton}>
            <ThemedText style={styles.addButtonText}>+</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <FlatList
          data={sortedTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem}
          style={styles.list}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ff4444",
    fontSize: 24,
    fontWeight: "bold",
  },
  checkbox: {
    marginRight: 12,
    justifyContent: "center",
  },
  completedTodoItem: {
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Light green background
  },
});
