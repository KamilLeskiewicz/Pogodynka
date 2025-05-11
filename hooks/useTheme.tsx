"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme } from "react-native"

export type ThemeMode = "light" | "dark" | "system"
export type ColorScheme = "default" | "vibrant" | "pastel" | "monochrome" | "custom"

export interface ThemeColors {
  backgroundColor: string
  cardBackground: string
  textColor: string
  secondaryTextColor: string
  accentColor: string
  errorColor: string
  borderColor: string
}

export interface GradientSet {
  clear: string[]
  clouds: string[]
  rain: string[]
  thunderstorm: string[]
  snow: string[]
  mist: string[]
  default: string[]
}

interface ThemeContextType {
  theme: ThemeColors
  isDark: boolean
  themeMode: ThemeMode
  colorScheme: ColorScheme
  gradients: GradientSet
  customAccentColor: string
  setThemeMode: (mode: ThemeMode) => void
  setColorScheme: (scheme: ColorScheme) => void
  setCustomAccentColor: (color: string) => void
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

const vibrantLightTheme: ThemeColors = {
  backgroundColor: "#f0f8ff",
  cardBackground: "#ffffff",
  textColor: "#1a1a2e",
  secondaryTextColor: "#4a4e69",
  accentColor: "#ff7700",
  errorColor: "#ff2e63",
  borderColor: "#d8e3e7",
}

const vibrantDarkTheme: ThemeColors = {
  backgroundColor: "#0a1128",
  cardBackground: "#1a1b41",
  textColor: "#f8f9fa",
  secondaryTextColor: "#c6c7c4",
  accentColor: "#ff7700",
  errorColor: "#ff2e63",
  borderColor: "#2d3047",
}

const pastelLightTheme: ThemeColors = {
  backgroundColor: "#f8edeb",
  cardBackground: "#ffffff",
  textColor: "#463f3a",
  secondaryTextColor: "#8a817c",
  accentColor: "#e07a5f",
  errorColor: "#f28482",
  borderColor: "#f0e6ef",
}

const pastelDarkTheme: ThemeColors = {
  backgroundColor: "#3d405b",
  cardBackground: "#4a4e69",
  textColor: "#f2e9e4",
  secondaryTextColor: "#d5bdaf",
  accentColor: "#e07a5f",
  errorColor: "#f28482",
  borderColor: "#4a4e69",
}

const monochromeLightTheme: ThemeColors = {
  backgroundColor: "#f8f9fa",
  cardBackground: "#ffffff",
  textColor: "#212529",
  secondaryTextColor: "#6c757d",
  accentColor: "#495057",
  errorColor: "#dc3545",
  borderColor: "#dee2e6",
}

const monochromeDarkTheme: ThemeColors = {
  backgroundColor: "#212529",
  cardBackground: "#343a40",
  textColor: "#f8f9fa",
  secondaryTextColor: "#adb5bd",
  accentColor: "#ced4da",
  errorColor: "#dc3545",
  borderColor: "#495057",
}

const defaultLightGradients: GradientSet = {
  clear: ["#00b4db", "#0083b0", "#6dd5ed"],
  clouds: ["#bdc3c7", "#2c3e50", "#bdc3c7"],
  rain: ["#5c6bc0", "#3949ab", "#5c6bc0"],
  thunderstorm: ["#4b6cb7", "#182848", "#4b6cb7"],
  snow: ["#e6dada", "#274046", "#e6dada"],
  mist: ["#757f9a", "#d7dde8", "#757f9a"],
  default: ["#e0eafc", "#cfdef3", "#e0eafc"],
}

const defaultDarkGradients: GradientSet = {
  clear: ["#0f2027", "#203a43", "#2c5364"],
  clouds: ["#2c3e50", "#4ca1af", "#2c3e50"],
  rain: ["#373b44", "#4286f4", "#373b44"],
  thunderstorm: ["#16222a", "#3a6073", "#16222a"],
  snow: ["#304352", "#d7d2cc", "#304352"],
  mist: ["#3e5151", "#decba4", "#3e5151"],
  default: ["#232526", "#414345", "#232526"],
}

const vibrantLightGradients: GradientSet = {
  clear: ["#FF9966", "#FF5E62", "#FFC371"],
  clouds: ["#8EC5FC", "#E0C3FC", "#8EC5FC"],
  rain: ["#4776E6", "#8E54E9", "#4776E6"],
  thunderstorm: ["#0F2027", "#203A43", "#2C5364"],
  snow: ["#E2E2E2", "#C9D6FF", "#E2E2E2"],
  mist: ["#CDDCDC", "#5CA4EA", "#CDDCDC"],
  default: ["#00C9FF", "#92FE9D", "#00C9FF"],
}

const vibrantDarkGradients: GradientSet = {
  clear: ["#FF416C", "#FF4B2B", "#FF416C"],
  clouds: ["#4568DC", "#B06AB3", "#4568DC"],
  rain: ["#3A1C71", "#D76D77", "#FFAF7B"],
  thunderstorm: ["#0F2027", "#203A43", "#2C5364"],
  snow: ["#8E9EAB", "#EEF2F3", "#8E9EAB"],
  mist: ["#3E5151", "#DECBA4", "#3E5151"],
  default: ["#12C2E9", "#C471ED", "#F64F59"],
}

const pastelLightGradients: GradientSet = {
  clear: ["#FFD3A5", "#FD6585", "#FFD3A5"],
  clouds: ["#E0C3FC", "#8EC5FC", "#E0C3FC"],
  rain: ["#A6C0FE", "#F68084", "#A6C0FE"],
  thunderstorm: ["#F0C27B", "#4B1248", "#F0C27B"],
  snow: ["#E2E2E2", "#C9D6FF", "#E2E2E2"],
  mist: ["#CDDCDC", "#5CA4EA", "#CDDCDC"],
  default: ["#FFDEE9", "#B5FFFC", "#FFDEE9"],
}

const pastelDarkGradients: GradientSet = {
  clear: ["#FF9A9E", "#FECFEF", "#FF9A9E"],
  clouds: ["#A1C4FD", "#C2E9FB", "#A1C4FD"],
  rain: ["#6A11CB", "#2575FC", "#6A11CB"],
  thunderstorm: ["#3C1053", "#AD5389", "#3C1053"],
  snow: ["#8E9EAB", "#EEF2F3", "#8E9EAB"],
  mist: ["#3E5151", "#DECBA4", "#3E5151"],
  default: ["#FF9A9E", "#FECFEF", "#FF9A9E"],
}

const monochromeLightGradients: GradientSet = {
  clear: ["#E0E0E0", "#FFFFFF", "#E0E0E0"],
  clouds: ["#D3D3D3", "#F5F5F5", "#D3D3D3"],
  rain: ["#BEBEBE", "#E8E8E8", "#BEBEBE"],
  thunderstorm: ["#A9A9A9", "#D3D3D3", "#A9A9A9"],
  snow: ["#F5F5F5", "#FFFFFF", "#F5F5F5"],
  mist: ["#DCDCDC", "#F5F5F5", "#DCDCDC"],
  default: ["#E0E0E0", "#FFFFFF", "#E0E0E0"],
}

const monochromeDarkGradients: GradientSet = {
  clear: ["#2D3436", "#000000", "#2D3436"],
  clouds: ["#2C3E50", "#4CA1AF", "#2C3E50"],
  rain: ["#373B44", "#4286F4", "#373B44"],
  thunderstorm: ["#16222A", "#3A6073", "#16222A"],
  snow: ["#304352", "#D7D2CC", "#304352"],
  mist: ["#3E5151", "#DECBA4", "#3E5151"],
  default: ["#232526", "#414345", "#232526"],
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system")
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("vibrant")
  const [customAccentColor, setCustomAccentColorState] = useState<string>("#FF7700")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("themeMode")
        const savedColorScheme = await AsyncStorage.getItem("colorScheme")
        const savedAccentColor = await AsyncStorage.getItem("customAccentColor")

        if (savedTheme) {
          setThemeModeState(savedTheme as ThemeMode)
        }
        if (savedColorScheme) {
          setColorSchemeState(savedColorScheme as ColorScheme)
        }
        if (savedAccentColor) {
          setCustomAccentColorState(savedAccentColor)
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

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem("colorScheme", scheme)
      setColorSchemeState(scheme)
    } catch (error) {
      console.error("Failed to save color scheme", error)
    }
  }

  const setCustomAccentColor = async (color: string) => {
    try {
      await AsyncStorage.setItem("customAccentColor", color)
      setCustomAccentColorState(color)
    } catch (error) {
      console.error("Failed to save custom accent color", error)
    }
  }

  const isDark = themeMode === "system" ? systemColorScheme === "dark" : themeMode === "dark"

  const getThemeColors = (): ThemeColors => {
    let baseTheme: ThemeColors

    switch (colorScheme) {
      case "vibrant":
        baseTheme = isDark ? vibrantDarkTheme : vibrantLightTheme
        break
      case "pastel":
        baseTheme = isDark ? pastelDarkTheme : pastelLightTheme
        break
      case "monochrome":
        baseTheme = isDark ? monochromeDarkTheme : monochromeLightTheme
        break
      case "custom":
        baseTheme = isDark
          ? { ...darkTheme, accentColor: customAccentColor }
          : { ...lightTheme, accentColor: customAccentColor }
        break
      default:
        baseTheme = isDark ? darkTheme : lightTheme
    }

    return baseTheme
  }

  const getGradients = (): GradientSet => {
    switch (colorScheme) {
      case "vibrant":
        return isDark ? vibrantDarkGradients : vibrantLightGradients
      case "pastel":
        return isDark ? pastelDarkGradients : pastelLightGradients
      case "monochrome":
        return isDark ? monochromeDarkGradients : monochromeLightGradients
      case "custom":
      case "default":
      default:
        return isDark ? defaultDarkGradients : defaultLightGradients
    }
  }

  const theme = getThemeColors()
  const gradients = getGradients()

  if (isLoading) {
    return null
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeMode,
        colorScheme,
        gradients,
        customAccentColor,
        setThemeMode,
        setColorScheme,
        setCustomAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
