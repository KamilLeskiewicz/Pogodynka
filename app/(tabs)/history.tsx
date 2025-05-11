"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"

export default function HistoryScreen() {
  const { searchHistory, loadSearchHistory, removeFromHistory, saveSearch } = useSearchStore()
  const { theme, isDark } = useTheme()
  const router = useRouter()

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const handleCityPress = (city: string) => {
    saveSearch(city)
    router.push("/")
  }

  const handleDelete = async (city: string) => {
    Alert.alert(
      "Usuń z historii",
      `Czy na pewno chcesz usunąć ${city} z historii?`,
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            await removeFromHistory(city)
          },
        },
      ]
    )
  }

  const renderRightActions = (city: string) => {
    return (
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.errorColor }]}
        onPress={() => handleDelete(city)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    )
  }

  const renderItem = ({ item: city }: { item: string }) => {
    return (
      <Swipeable renderRightActions={() => renderRightActions(city)}>
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
          onPress={() => handleCityPress(city)}
        >
          <View style={styles.cityContainer}>
            <Ionicons name="location-outline" size={24} color={theme.textColor} />
            <Text style={[styles.cityName, { color: theme.textColor }]}>{city}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.secondaryTextColor} />
        </TouchableOpacity>
      </Swipeable>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {searchHistory.length > 0 ? (
        <FlatList
          data={searchHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={theme.secondaryTextColor} />
          <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
            Brak historii wyszukiwania
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityName: {
    fontSize: 16,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 12,
    marginBottom: 8,
  },
})
