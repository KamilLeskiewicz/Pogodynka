"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

type ThemeMode = "light" | "dark" | "system"

interface ThemeColors {
  backgroundColor: string
  cardBackground: string
  textColor: string
  secondaryTextColor: string
  accentColor: string
  errorColor: string
  borderColor: string
}

interface ThemeContextType {
  theme: ThemeColors
  isDark: boolean
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

const lightTheme: ThemeColors = {
  backgroundColor: "#f5f5f5",
  cardBackground: "#ffffff",
  textColor: "#333333",
  secondaryTextColor: "#666666",
  accentColor: "#1DA1F2",
  errorColor: "#FF6B6B",
  borderColor: "#e0e0e0",
}

const darkTheme: ThemeColors = {
  backgroundColor: "#121212",
  cardBackground: "#1e1e1e",
  textColor: "#f5f5f5",
  secondaryTextColor: "#a0a0a0",
  accentColor: "#1DA1F2",
  errorColor: "#FF6B6B",
  borderColor: "#333333",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("themeMode")
        if (savedTheme) {
          setThemeModeState(savedTheme as ThemeMode)
        }
      } catch (error) {
        console.error("Failed to load theme", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode)
      setThemeModeState(mode)
    } catch (error) {
      console.error("Failed to save theme", error)
    }
  }

  const isDark = themeMode === "system" ? systemColorScheme === "dark" : themeMode === "dark"

  const theme = isDark ? darkTheme : lightTheme

  if (isLoading) {
    return null
  }

  return <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
