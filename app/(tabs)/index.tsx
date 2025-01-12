import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  View,
  ScrollView,
  Platform,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCategories } from "@/context/CategoryContext";
import { TouchableWithoutFeedback } from "react-native";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  dueTime?: string;
  priority?: string;
  category?: string;
  notificationId?: string;
  recurrence?: {
    type: "daily" | "weekly" | "monthly" | "yearly";
    enabled: boolean;
  };
  note?: string;
  taggedUsers?: string[];
}

interface Priority {
  id: string;
  name: string;
  color: string;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Add this new interface for the edit modal state
interface EditModalState {
  isVisible: boolean;
  todo: Todo | null;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [dueTime, setDueTime] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("3");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [recurrenceType, setRecurrenceType] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [isRecurring, setIsRecurring] = useState(false);
  const [note, setNote] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);

  // Add new state for edit modal
  const [editModal, setEditModal] = useState<EditModalState>({
    isVisible: false,
    todo: null,
  });
  const [editNote, setEditNote] = useState("");
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTaggedUsers, setEditTaggedUsers] = useState<string[]>([]);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "tabIconDefault");
  const backgroundColor = useThemeColor({}, "background");

  const { categories } = useCategories();

  const priorities: Priority[] = [
    { id: "1", name: "Urgent", color: "bg-red-500" },
    { id: "2", name: "High", color: "bg-orange-500" },
    { id: "3", name: "Medium", color: "bg-yellow-500" },
    { id: "4", name: "Low", color: "bg-blue-500" },
  ];

  // Sort todos with completed items at the bottom
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }, [todos]);

  // Add this function to request permissions
  async function requestNotificationPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("You need to enable notifications to receive reminders!");
      return false;
    }
    return true;
  }

  // Add this function to schedule a reminder
  async function scheduleReminder(
    taskText: string,
    dueDate: Date,
    dueTime: string
  ) {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Combine date and time
    const [hours, minutes] = dueTime.split(":");
    const scheduledTime = new Date(dueDate);
    scheduledTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    // Set reminder 5 minutes before
    const reminderTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000);

    // Cancel any existing notification for this task
    const identifier = `reminder-${Date.now()}`;

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `Your task "${taskText}" is due in 5 minutes!`,
        data: { taskId: identifier },
      },
      trigger: {
        date: reminderTime,
      },
      identifier,
    });

    return identifier;
  }

  const addTodo = async () => {
    if (newTodo.trim() === "") return;

    let notificationId = null;
    if (selectedDate && dueTime) {
      notificationId = await scheduleReminder(
        newTodo.trim(),
        selectedDate,
        dueTime
      );
    }

    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        dueDate: selectedDate,
        dueTime,
        priority: selectedPriority,
        category: selectedCategory,
        notificationId,
        recurrence: isRecurring
          ? {
              type: recurrenceType,
              enabled: true,
            }
          : undefined,
        note: note.trim(),
        taggedUsers: taggedUsers,
      },
    ]);

    setNewTodo("");
    setSelectedDate(undefined);
    setDueTime("");
    setSelectedPriority("3");
    setSelectedCategory("");
    setIsRecurring(false);
    setRecurrenceType("daily");
    setShowCalendar(false);
    setNote("");
    setTaggedUsers([]);
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    // If the task is completed and it's recurring, create the next occurrence
    if (todo && !todo.completed && todo.recurrence?.enabled) {
      handleRecurringTask(todo);
    }
  };

  const deleteTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(todo.notificationId);
    }
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios"); // Only hide on Android
    if (event.type === "set" && selectedTime) {
      setDueTime(format(selectedTime, "HH:mm"));
    }
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
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
          <View className="p-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="text-lg font-semibold dark:text-white">
                Set Task Details
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View className="flex-row justify-between items-center mb-2">
              <TouchableOpacity
                onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1"
              >
                <Ionicons name="chevron-back" size={24} color={textColor} />
              </TouchableOpacity>
              <ThemedText className="text-base font-semibold dark:text-white">
                {format(currentMonth, "MMMM yyyy")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1"
              >
                <Ionicons name="chevron-forward" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Calendar Section - Reduced vertical spacing */}
            <View className="mb-3">
              {/* Weekday Headers */}
              <View className="flex-row">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <View key={day} className="flex-1 items-center">
                      <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                        {day}
                      </ThemedText>
                    </View>
                  )
                )}
              </View>

              {/* Calendar Grid - Reduced cell size */}
              <View className="flex-row flex-wrap">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const isSelected =
                    selectedDate &&
                    format(selectedDate, "yyyy-MM-dd") ===
                      format(date, "yyyy-MM-dd");
                  const isToday =
                    format(new Date(), "yyyy-MM-dd") ===
                    format(date, "yyyy-MM-dd");

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(date)}
                      className={`w-[14.28%] aspect-square items-center justify-center
                        ${isSelected ? "bg-blue-500 rounded-full" : ""}
                        ${
                          isToday && !isSelected
                            ? "border border-blue-500 rounded-full"
                            : ""
                        }`}
                    >
                      <ThemedText
                        className={`text-sm
                          ${isSelected ? "text-white" : "dark:text-white"}
                          ${isToday && !isSelected ? "text-blue-500" : ""}`}
                      >
                        {format(date, "d")}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time and Category Section */}
            <View className="flex-row justify-between items-start mb-3">
              {/* Time Picker Column */}
              <View className="flex-1 mr-2">
                <ThemedText className="text-sm font-semibold mb-1 dark:text-white">
                  Time
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="h-10 border border-gray-300 dark:border-gray-600 rounded-lg px-3 justify-center"
                >
                  <ThemedText className="text-sm dark:text-white">
                    {dueTime || "Select time"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Priority Selection */}
              <View className="flex-1">
                <ThemedText className="text-sm font-semibold mb-1 dark:text-white">
                  Priority
                </ThemedText>
                <View className="flex-row flex-wrap gap-2">
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.id}
                      onPress={() => setSelectedPriority(priority.id)}
                      className={`rounded-lg px-3 py-2 ${priority.color} ${
                        selectedPriority === priority.id
                          ? "border-2 border-white dark:border-gray-300"
                          : "opacity-70"
                      }`}
                    >
                      <ThemedText className="text-white text-sm">
                        {priority.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Add Recurrence Section */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <ThemedText className="text-sm font-semibold">
                  Recurring Task
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setIsRecurring(!isRecurring)}
                  className={`px-3 py-1 rounded-full ${
                    isRecurring ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <ThemedText
                    className={`${isRecurring ? "text-[#ffffff]" : ""}`}
                  >
                    {isRecurring ? "On" : "Off"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {isRecurring && (
                <View className="flex-row flex-wrap gap-2">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setRecurrenceType(type)}
                        className={`rounded-lg px-3 py-2 ${
                          recurrenceType === type
                            ? "bg-blue-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        <ThemedText
                          className={`text-sm ${
                            recurrenceType === type ? "text-white" : ""
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </ThemedText>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              )}
            </View>

            {/* Categories Section */}
            <View>
              <ThemedText className="text-sm font-semibold mb-1 dark:text-white">
                Category
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row p-1">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`flex-row items-center px-3 py-2 rounded-full mr-2 ${
                        selectedCategory === category.id
                          ? category.color
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <Ionicons
                        name={category.icon}
                        size={16}
                        color={
                          selectedCategory === category.id ? "white" : textColor
                        }
                      />
                      <ThemedText
                        className={`ml-2 ${
                          selectedCategory === category.id ? "text-white" : ""
                        }`}
                      >
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              onPress={() => {
                addTodo();
                setShowCalendar(false);
              }}
              className="bg-blue-500 p-3 rounded-lg"
            >
              <ThemedText className="text-[#ffffff] text-center font-semibold">
                Add Task
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Time Picker Modal */}
          {showTimePicker && (
            <View className="bg-white dark:bg-gray-800 px-4 pb-4">
              {Platform.OS === "android" ? (
                <DateTimePicker
                  value={
                    dueTime ? new Date(`2000-01-01T${dueTime}:00`) : new Date()
                  }
                  mode="time"
                  is24Hour={true}
                  onChange={onTimeChange}
                  display="spinner"
                  textColor={textColor} // Add this for dark mode visibility
                />
              ) : (
                <DateTimePicker
                  value={
                    dueTime ? new Date(`2000-01-01T${dueTime}:00`) : new Date()
                  }
                  mode="time"
                  is24Hour={true}
                  onChange={onTimeChange}
                  display="spinner"
                  textColor={textColor} // Add this for dark mode visibility
                  themeVariant={
                    backgroundColor === "#000000" ? "dark" : "light"
                  }
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <ThemedView
      className={`flex-row items-center p-4 rounded-2xl mb-3 border border-gray-300 dark:border-gray-300 ${
        item.completed ? "bg-green-50/10" : ""
      }`}
      style={{ backgroundColor }}
    >
      <TouchableOpacity
        className="mr-3 justify-center"
        onPress={() => toggleTodo(item.id)}
      >
        {item.completed ? (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#666" />
        )}
      </TouchableOpacity>
      {/* <TouchableWithoutFeedback onPress={() => toggleTodo(item.id)}>
        <View className="mr-3 justify-center">
          {item.completed ? (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#666" />
          )}
        </View>
      </TouchableWithoutFeedback> */}

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <ThemedText
            className={`text-base font-medium ${
              item.completed ? "line-through opacity-60" : ""
            }`}
          >
            {item.text}
            <Text>{item.note}</Text>
          </ThemedText>
          <View className="flex-row">
            <TouchableOpacity
              className="p-2"
              onPress={() => {
                // Open edit modal and populate with task details
                setEditModal({ isVisible: true, todo: item });
                setEditText(item.text);
                setEditNote(item.note || "");
                setEditDate(item.dueDate);
                setEditTime(item.dueTime || "");
                setEditPriority(item.priority || "");
                setEditCategory(item.category || "");
                setEditTaggedUsers(item.taggedUsers || []);
              }}
            >
              <Ionicons name="pencil" size={24} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2"
              onPress={() => deleteTodo(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center mt-2 flex-wrap">
          {item.category && (
            <View
              className={`px-3 py-1 rounded-full mr-2 mb-1 ${
                categories.find((c) => c.id === item.category)?.color
              }`}
            >
              <ThemedText className="text-white text-xs font-medium">
                {categories.find((c) => c.id === item.category)?.name}
              </ThemedText>
            </View>
          )}
          {item.priority && (
            <View
              className={`px-3 py-1 rounded-full mr-2 mb-1 ${
                priorities.find((p) => p.id === item.priority)?.color
              }`}
            >
              <ThemedText className="text-white text-xs font-medium">
                {priorities.find((p) => p.id === item.priority)?.name}
              </ThemedText>
            </View>
          )}
          {(item.dueDate || item.dueTime) && (
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={14} color={textColor} />
              <ThemedText className="text-xs ml-1 opacity-60">
                {item.dueDate && format(item.dueDate, "MMM d")}
                {item.dueTime && ` at ${item.dueTime}`}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );

  // Add this function to handle recurring tasks
  const handleRecurringTask = (todo: Todo) => {
    if (todo.recurrence?.enabled && todo.dueDate) {
      const newDueDate = new Date(todo.dueDate);

      switch (todo.recurrence.type) {
        case "daily":
          newDueDate.setDate(newDueDate.getDate() + 1);
          break;
        case "weekly":
          newDueDate.setDate(newDueDate.getDate() + 7);
          break;
        case "monthly":
          newDueDate.setMonth(newDueDate.getMonth() + 1);
          break;
        case "yearly":
          newDueDate.setFullYear(newDueDate.getFullYear() + 1);
          break;
      }

      const newTodo = {
        ...todo,
        id: Date.now().toString(),
        completed: false,
        dueDate: newDueDate,
      };

      setTodos((prevTodos) => [...prevTodos, newTodo]);
    }
  };

  // Add sample users (replace with your actual users data/API)
  const availableUsers = [
    { id: "1", username: "@john.doe" },
    { id: "2", username: "@jane.smith" },
    { id: "3", username: "@mike.wilson" },
  ];

  // Add new state for suggestions
  const [suggestions, setSuggestions] = useState<
    { id: string; username: string }[]
  >([]);

  // Add function to handle task click
  const handleTaskClick = (todo: Todo) => {
    setEditModal({ isVisible: true, todo });
    setEditText(todo.text);
    setEditNote(todo.note || "");
    setEditDate(todo.dueDate);
    setEditTime(todo.dueTime || "");
    setEditPriority(todo.priority || "");
    setEditCategory(todo.category || "");
    setEditTaggedUsers(todo.taggedUsers || []);
  };

  // Add function to update todo
  const updateTodo = async () => {
    if (!editModal.todo) return;

    let notificationId = editModal.todo.notificationId;
    if (editDate && editTime) {
      // Cancel existing notification if it exists
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      // Schedule new notification
      notificationId = await scheduleReminder(
        editText.trim(),
        editDate,
        editTime
      );
    }

    setTodos(
      todos.map((todo) =>
        todo.id === editModal.todo?.id
          ? {
              ...todo,
              text: editText.trim(),
              dueDate: editDate,
              dueTime: editTime,
              priority: editPriority,
              category: editCategory,
              note: editNote.trim(),
              taggedUsers: editTaggedUsers,
              notificationId,
            }
          : todo
      )
    );

    setEditModal({ isVisible: false, todo: null });
    resetEditFields();
  };

  const resetEditFields = () => {
    setEditText("");
    setEditDate(undefined);
    setEditTime("");
    setEditPriority("");
    setEditCategory("");
    setEditNote("");
    setEditTaggedUsers([]);
  };

  // Modify the renderItem function to make tasks clickable
  const renderItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity
      onPress={() => handleTaskClick(item)}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm"
    >
      <ThemedText>{item.text}</ThemedText>
    </TouchableOpacity>
  );

  // Add the edit modal component
  const renderEditModal = () => (
    <Modal
      visible={editModal.isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setEditModal({ isVisible: false, todo: null })}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-xl font-semibold">
                Edit Task
              </ThemedText>
              <TouchableOpacity
                onPress={() => setEditModal({ isVisible: false, todo: null })}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Task Text Input */}
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4"
              style={{ color: textColor }}
              value={editText}
              onChangeText={setEditText}
              placeholder="Task description"
              placeholderTextColor={placeholderColor}
            />

            {/* Short Note Input */}
            <View className="mb-4">
              <ThemedText className="text-base mb-2">Short Notee</ThemedText>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[80px]"
                style={{ color: textColor }}
                value={editNote}
                onChangeText={setEditNote}
                multiline
                placeholder="Add a note... Use @ to tag users"
                placeholderTextColor={placeholderColor}
              />
              {/* Tagged Users Pills */}
              {editTaggedUsers.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row mt-2"
                >
                  {editTaggedUsers.map((userId) => {
                    const user = availableUsers.find((u) => u.id === userId);
                    return (
                      <View
                        key={userId}
                        className="flex-row items-center bg-blue-100 dark:bg-blue-800 rounded-full px-3 py-1 mr-2"
                      >
                        <ThemedText className="text-sm">
                          {user?.username}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() =>
                            setEditTaggedUsers((tags) =>
                              tags.filter((id) => id !== userId)
                            )
                          }
                          className="ml-2"
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color={textColor}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Date, Time, Priority, Category selections... */}
            {/* (Keep existing selection UI but use edit state variables) */}

            {/* Update Button */}
            <TouchableOpacity
              onPress={updateTodo}
              className="bg-blue-500 p-3 rounded-lg mt-4"
            >
              <ThemedText className="text-white text-center font-semibold">
                Update Task
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
              <ThemedText className="text-white text-2xl font-bold ">
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
      {renderEditModal()}
    </SafeAreaView>
  );
}
