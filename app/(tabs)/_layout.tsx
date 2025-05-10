"use client"

import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { TouchableOpacity } from "react-native"
import { useTheme } from "../../hooks/useTheme"

export default function TabLayout() {
  const { theme, isDark, setThemeMode } = useTheme()

  const toggleTheme = () => {
    setThemeMode(isDark ? "light" : "dark")
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accentColor,
        tabBarInactiveTintColor: theme.secondaryTextColor,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.borderColor,
        },
        headerStyle: {
          backgroundColor: theme.cardBackground,
        },
        headerTintColor: theme.textColor,
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={theme.textColor} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Aktualna",
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Prognoza",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historia",
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
