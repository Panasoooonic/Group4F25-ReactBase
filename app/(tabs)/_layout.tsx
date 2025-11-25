import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trip-record"
        options={{
          title: "Records",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={28} name="history" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="vehicle"
        options={{
          title: "Vehicle",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={28} name="car" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
