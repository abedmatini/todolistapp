import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ProfileScreen() {
  const textColor = useThemeColor({}, "text");

  const profileItems = [
    { icon: "person-outline", label: "Name", value: "John Doe" },
    { icon: "mail-outline", label: "Email", value: "john.doe@example.com" },
    { icon: "call-outline", label: "Phone", value: "+1 234 567 890" },
    { icon: "location-outline", label: "Location", value: "New York, USA" },
    { icon: "calendar-outline", label: "Joined", value: "January 2024" },
  ];

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 p-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View className="items-center mb-6">
            <View className="relative">
              <Image
                source={require("@/assets/images/default-avatar.png")}
                className="w-32 h-32 rounded-full"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full">
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <ThemedText className="text-xl font-bold mt-4">John Doe</ThemedText>
            <ThemedText className="text-sm opacity-60">
              Premium Member
            </ThemedText>
          </View>

          {/* Stats Section */}
          <View className="flex-row justify-around mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <View className="items-center">
              <ThemedText className="text-lg font-bold">28</ThemedText>
              <ThemedText className="text-sm opacity-60">Tasks</ThemedText>
            </View>
            <View className="items-center">
              <ThemedText className="text-lg font-bold">23</ThemedText>
              <ThemedText className="text-sm opacity-60">Completed</ThemedText>
            </View>
            <View className="items-center">
              <ThemedText className="text-lg font-bold">5</ThemedText>
              <ThemedText className="text-sm opacity-60">Pending</ThemedText>
            </View>
          </View>

          {/* Profile Items */}
          <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            {profileItems.map((item, index) => (
              <View
                key={index}
                className={`flex-row items-center py-3 ${
                  index !== profileItems.length - 1
                    ? "border-b border-gray-200 dark:border-gray-700"
                    : ""
                }`}
              >
                <View className="w-8 items-center">
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={textColor}
                  />
                </View>
                <View className="flex-1 ml-3">
                  <ThemedText className="text-sm opacity-60">
                    {item.label}
                  </ThemedText>
                  <ThemedText className="text-base">{item.value}</ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity className="bg-blue-500 p-4 rounded-xl mt-6">
            <ThemedText className="text-white text-center font-semibold">
              Edit Profile
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
