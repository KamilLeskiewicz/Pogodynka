"use client"

import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import { Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import { useSearchStore } from "../../hooks/useSearchStore"
import { type ColorScheme, type ThemeMode, useTheme } from "../../hooks/useTheme"

const { width } = Dimensions.get("window")
const ACCENT_COLORS = [
  "#FF7700", 
  "#1DA1F2", 
  "#FF2E63", 
  "#00C853", 
  "#7C4DFF",
  "#FF5722", 
  "#00BCD4",
  "#FFEB3B",
  "#E33EE6",
  "#78d955",
  "#83e9f2",
  "#ff0400",
]

const COLOR_SCHEMES: { label: string; value: ColorScheme }[] = [
  { label: "Domyślny", value: "default" },
  { label: "Żywy", value: "vibrant" },
  { label: "Pastelowy", value: "pastel" },
  { label: "Monochromatyczny", value: "monochrome" },
  { label: "Niestandardowy", value: "custom" },
]

const THEME_MODES: { label: string; value: ThemeMode; icon: string }[] = [
  { label: "Jasny", value: "light", icon: "sunny-outline" },
  { label: "Ciemny", value: "dark", icon: "moon-outline" },
  { label: "Systemowy", value: "system", icon: "phone-portrait-outline" },
]

export default function SettingsScreen() {
  const {
    theme,
    isDark,
    themeMode,
    colorScheme,
    customAccentColor,
    setThemeMode,
    setColorScheme,
    setCustomAccentColor,
  } = useTheme()
  const { preferences, updatePreferences } = useSearchStore()
  const [selectedAccentColor, setSelectedAccentColor] = useState(customAccentColor)

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme)
  }

  const handleAccentColorChange = (color: string) => {
    setSelectedAccentColor(color)
    if (colorScheme === "custom") {
      setCustomAccentColor(color)
    } else {
      Alert.alert(
        "Zmień schemat kolorów",
        "Aby zastosować niestandardowy kolor akcentujący, musisz przełączyć się na schemat 'Niestandardowy'.",
        [
          {
            text: "Anuluj",
            style: "cancel",
          },
          {
            text: "Przełącz i zastosuj",
            onPress: () => {
              setColorScheme("custom")
              setCustomAccentColor(color)
            },
          },
        ],
      )
    }
  }

  const toggleTemperatureUnit = async () => {
    try {
      await updatePreferences({ useMetricSystem: !preferences.useMetricSystem })
    } catch (error) {
      console.error("Failed to update temperature unit", error)
      Alert.alert("Błąd", "Nie udało się zaktualizować jednostek temperatury")
    }
  }

  const renderColorOption = (color: string) => {
    const isSelected = colorScheme === "custom" && color === customAccentColor

    return (
      <TouchableOpacity
        key={color}
        style={[styles.colorOption, { backgroundColor: color }, isSelected && styles.selectedColorOption]}
        onPress={() => handleAccentColorChange(color)}
      >
        {isSelected && <Ionicons name="checkmark" size={20} color="white" />}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Ustawienia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Preferencje</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceLabel, { color: theme.textColor }]}>Jednostki temperatury</Text>
              <Text style={[styles.preferenceDescription, { color: theme.secondaryTextColor }]}>
                {preferences.useMetricSystem ? "Celsjusz (°C)" : "Fahrenheit (°F)"}
              </Text>
            </View>
            <Switch
              value={preferences.useMetricSystem}
              onValueChange={toggleTemperatureUnit}
              trackColor={{ false: theme.borderColor, true: theme.accentColor }}
              thumbColor={preferences.useMetricSystem ? "white" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Tryb motywu</Text>
          <View style={styles.themeOptions}>
            {THEME_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.themeOption,
                  { backgroundColor: themeMode === mode.value ? theme.accentColor : theme.backgroundColor },
                ]}
                onPress={() => handleThemeModeChange(mode.value)}
              >
                <Ionicons
                  name={mode.icon as any}
                  size={24}
                  color={themeMode === mode.value ? "white" : theme.secondaryTextColor}
                />
                <Text style={[styles.themeOptionText, { color: themeMode === mode.value ? "white" : theme.textColor }]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Schemat kolorów</Text>
          {COLOR_SCHEMES.map((scheme) => (
            <TouchableOpacity
              key={scheme.value}
              style={[
                styles.schemeOption,
                { borderColor: theme.borderColor },
                colorScheme === scheme.value && { borderColor: theme.accentColor, borderWidth: 2 },
              ]}
              onPress={() => handleColorSchemeChange(scheme.value)}
            >
              <View style={styles.schemeInfo}>
                <Text style={[styles.schemeLabel, { color: theme.textColor }]}>{scheme.label}</Text>
                <View style={styles.schemeSample}>
                  {scheme.value === "default" && <View style={[styles.sampleColor, { backgroundColor: "#1DA1F2" }]} />}
                  {scheme.value === "vibrant" && (
                    <>
                      <View style={[styles.sampleColor, { backgroundColor: "#FF7700" }]} />
                      <View style={[styles.sampleColor, { backgroundColor: "#FF5E62" }]} />
                      <View style={[styles.sampleColor, { backgroundColor: "#FFC371" }]} />
                    </>
                  )}
                  {scheme.value === "pastel" && (
                    <>
                      <View style={[styles.sampleColor, { backgroundColor: "#E07A5F" }]} />
                      <View style={[styles.sampleColor, { backgroundColor: "#F2CC8F" }]} />
                      <View style={[styles.sampleColor, { backgroundColor: "#81B29A" }]} />
                    </>
                  )}
                  {scheme.value === "monochrome" && (
                    <>
                      <View style={[styles.sampleColor, { backgroundColor: "#212529" }]} />
                      <View style={[styles.sampleColor, { backgroundColor: "#495057" }]} />
                      <View style={[styles.sampleColor, { backgroundColor: "#6C757D" }]} />
                    </>
                  )}
                  {scheme.value === "custom" && (
                    <View style={[styles.sampleColor, { backgroundColor: customAccentColor }]} />
                  )}
                </View>
              </View>
              {colorScheme === scheme.value && <Ionicons name="checkmark-circle" size={24} color={theme.accentColor} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Kolor akcentujący</Text>
          <Text style={[styles.sectionDescription, { color: theme.secondaryTextColor }]}>
            Wybierz kolor akcentujący dla niestandardowego schematu kolorów
          </Text>
          <View style={styles.colorOptions}>{ACCENT_COLORS.map((color) => renderColorOption(color))}</View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Podgląd</Text>
          <View style={[styles.previewCard, { backgroundColor: theme.accentColor }]}>
            <Text style={styles.previewTitle}>Pogodynka</Text>
            <Text style={styles.previewSubtitle}>Twoja ulubiona aplikacja pogodowa</Text>
          </View>
          <View style={[styles.previewButtons, { borderColor: theme.borderColor }]}>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: theme.accentColor }]}>
              <Text style={styles.previewButtonText}>Przycisk główny</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewButton, { backgroundColor: "transparent", borderColor: theme.accentColor }]}
            >
              <Text style={[styles.previewButtonText, { color: theme.accentColor }]}>Przycisk dodatkowy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  themeOptionText: {
    marginTop: 8,
    fontWeight: "500",
  },
  schemeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  schemeSample: {
    flexDirection: "row",
  },
  sampleColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorOption: {
    width: width / 5 - 16,
    height: width / 5 - 16,
    borderRadius: (width / 5 - 16) / 2,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "white",
  },
  previewCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 16,
  },
  previewButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  previewButtonText: {
    color: "white",
    fontWeight: "600",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  preferenceDescription: {
    fontSize: 14,
    marginTop: 4,
  },
})
