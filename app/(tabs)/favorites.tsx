"use client"

import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Swipeable from "react-native-gesture-handler/Swipeable"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"
import { fetchCurrentWeather } from "../../utils/api"

interface FavoriteItemData {
  name: string
  temperature?: number
  description?: string
  icon?: string
  weatherMain?: string
  loading: boolean
  error: boolean
}

export default function FavoritesScreen() {
  const { favorites, saveSearch, removeFavorite } = useSearchStore()
  const { theme, isDark } = useTheme()
  const navigation = useNavigation()
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItemData[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const listItemAnims = useRef<{ [key: string]: Animated.Value }>({}).current

  useEffect(() => {
    loadFavoriteData()
  }, [favorites])

  useEffect(() => {
    if (favoriteItems.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start()

      favoriteItems.forEach((item, index) => {
        if (!listItemAnims[item.name]) {
          listItemAnims[item.name] = new Animated.Value(0)
        }

        Animated.timing(listItemAnims[item.name], {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start()
      })
    }
  }, [favoriteItems])

  const loadFavoriteData = async () => {
    fadeAnim.setValue(0)

    const initialItems = favorites.map((fav) => ({
      name: fav.name,
      loading: true,
      error: false,
    }))

    setFavoriteItems(initialItems)

    const updatedItems = await Promise.all(
      favorites.map(async (fav) => {
        try {
          const data = await fetchCurrentWeather(fav.name)
          return {
            name: fav.name,
            temperature: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            weatherMain: data.weather[0].main,
            loading: false,
            error: false,
          }
        } catch (error) {
          console.error(`Error fetching data for ${fav.name}:`, error)
          return {
            name: fav.name,
            loading: false,
            error: true,
          }
        }
      }),
    )

    setFavoriteItems(updatedItems)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadFavoriteData()
  }

  const handleSelectFavorite = (cityName: string) => {
    saveSearch(cityName)
    // @ts-ignore
    navigation.navigate("index")
  }

  const handleRemoveFavorite = (cityName: string) => {
    Alert.alert("Usuń ulubione", `Czy na pewno chcesz usunąć ${cityName} z ulubionych?`, [
      {
        text: "Anuluj",
        style: "cancel",
      },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => removeFavorite(cityName),
      },
    ])
  }

  const getWeatherColor = (weatherMain: string): string => {
    switch (weatherMain?.toLowerCase()) {
      case "clear":
        return isDark ? "#1565C0" : "#2196F3" 
      case "clouds":
        return isDark ? "#455A64" : "#78909C" 
      case "rain":
      case "drizzle":
        return isDark ? "#0D47A1" : "#1976D2" 
      case "thunderstorm":
        return isDark ? "#4A148C" : "#6A1B9A" 
      case "snow":
        return isDark ? "#546E7A" : "#90A4AE"
      case "mist":
      case "fog":
      case "haze":
        return isDark ? "#37474F" : "#607D8B" 
      default:
        return isDark ? "#1565C0" : "#2196F3"
    }
  }

  const renderRightActions = (cityName: string) => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: theme.errorColor }]}
        onPress={() => handleRemoveFavorite(cityName)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    )
  }

  const renderFavoriteItem = ({ item, index }: { item: FavoriteItemData; index: number }) => {
    const backgroundColor = item.weatherMain ? getWeatherColor(item.weatherMain) : theme.cardBackground
    const itemAnim = listItemAnims[item.name] || new Animated.Value(1)

    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <Swipeable renderRightActions={() => renderRightActions(item.name)}>
          <TouchableOpacity
            style={[styles.favoriteItem, { backgroundColor }]}
            onPress={() => handleSelectFavorite(item.name)}
            activeOpacity={0.7}
          >
            <View style={styles.favoriteContent}>
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteName}>{item.name}</Text>

                {item.loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : item.error ? (
                  <Text style={styles.favoriteError}>Błąd pobierania danych</Text>
                ) : (
                  <Text style={styles.favoriteDescription}>{item.description}</Text>
                )}
              </View>

              <View style={styles.favoriteTemp}>
                {item.icon && !item.loading && !item.error && (
                  <View style={styles.favoriteIconContainer}>
                    <Ionicons name="partly-sunny-outline" size={24} color="white" />
                  </View>
                )}

                {item.temperature !== undefined && !item.loading && !item.error && (
                  <Text style={styles.favoriteTemperature}>{Math.round(item.temperature)}°C</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Ulubione lokalizacje</Text>
      </View>

      {favoriteItems.length > 0 ? (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={favoriteItems}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color={theme.secondaryTextColor} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>Brak ulubionych lokalizacji</Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryTextColor }]}>
            Dodaj lokalizacje do ulubionych, aby szybko do nich wracać
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  favoriteItem: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "white",
  },
  favoriteDescription: {
    fontSize: 14,
    textTransform: "capitalize",
    color: "white",
  },
  favoriteError: {
    fontSize: 12,
    color: "#FF6B6B",
  },
  favoriteTemp: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteIconContainer: {
    marginRight: 8,
  },
  favoriteTemperature: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
})
