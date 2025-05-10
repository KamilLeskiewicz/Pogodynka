"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState } from "react"
import { Alert, Animated, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"

type HistoryItemProps = {
  item: string
}

export default function SearchHistoryScreen() {
  const { searchHistory, saveSearch, loadSearchHistory } = useSearchStore()
  const { theme } = useTheme()
  const [refreshing, setRefreshing] = useState(false)

  const clearHistory = async () => {
    Alert.alert("Wyczyść historię", "Czy na pewno chcesz wyczyścić całą historię wyszukiwań?", [
      {
        text: "Anuluj",
        style: "cancel",
      },
      {
        text: "Wyczyść",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("searchHistory")
            await loadSearchHistory()
          } catch (error) {
            console.error("Failed to clear history", error)
          }
        },
      },
    ])
  }

  const deleteHistoryItem = async (city: string) => {
    try {
      const newHistory = searchHistory.filter((item) => item !== city)
      await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory))
      await loadSearchHistory()
    } catch (error) {
      console.error("Failed to delete history item", error)
    }
  }

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    city: string,
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: "clamp",
    })

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteHistoryItem(city)}>
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderHistoryItem = ({ item }: HistoryItemProps) => (
    <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => saveSearch(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="location-outline" size={24} color={theme.accentColor} />
        <Text style={[styles.cityText, { color: theme.textColor }]}>{item}</Text>
        <Ionicons name="chevron-forward" size={24} color={theme.secondaryTextColor} />
      </TouchableOpacity>
    </Swipeable>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Historia wyszukiwań</Text>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Ionicons name="trash-outline" size={24} color={theme.errorColor} />
          </TouchableOpacity>
        )}
      </View>

      {searchHistory.length > 0 ? (
        <FlatList
          data={searchHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={theme.secondaryTextColor} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>Brak historii wyszukiwań</Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryTextColor }]}>
            Wyszukane miasta pojawią się tutaj
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cityText: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  deleteAction: {
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButton: {
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
})
