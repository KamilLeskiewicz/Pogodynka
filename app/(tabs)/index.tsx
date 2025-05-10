"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"
import { fetchCurrentWeather } from "../../utils/api"

interface WeatherData {
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  weather: Array<{
    description: string
    icon: string
    main: string
  }>
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    temp_min: number
    temp_max: number
  }
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  visibility: number
  dt: number
}

export default function CurrentWeatherScreen() {
  const { city, saveSearch } = useSearchStore()
  const [searchText, setSearchText] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { theme, isDark } = useTheme()

  const fadeAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    if (city) {
      loadWeatherData(city)
    }
  }, [city])

  useEffect(() => {
    if (weather) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start()
    }
  }, [weather])

  const loadWeatherData = async (cityName: string) => {
    setLoading(true)
    setError(null)
    fadeAnim.setValue(0)

    try {
      const data = await fetchCurrentWeather(cityName)
      setWeather(data)
    } catch (err) {
      setError("Nie udało się pobrać danych pogodowych. Sprawdź nazwę miasta.")
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    if (city) {
      loadWeatherData(city)
    }
  }

  const handleSearch = () => {
    if (searchText.trim()) {
      saveSearch(searchText.trim())
      setSearchText("")
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`
  }

  const getWeatherBackground = (weatherMain: string): string[] => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return isDark ? ["#0f2027", "#203a43", "#2c5364"] : ["#00b4db", "#0083b0", "#6dd5ed"]
      case "clouds":
        return isDark ? ["#2c3e50", "#4ca1af", "#2c3e50"] : ["#bdc3c7", "#2c3e50", "#bdc3c7"]
      case "rain":
      case "drizzle":
        return isDark ? ["#373b44", "#4286f4", "#373b44"] : ["#5c6bc0", "#3949ab", "#5c6bc0"]
      case "thunderstorm":
        return isDark ? ["#16222a", "#3a6073", "#16222a"] : ["#4b6cb7", "#182848", "#4b6cb7"]
      case "snow":
        return isDark ? ["#304352", "#d7d2cc", "#304352"] : ["#e6dada", "#274046", "#e6dada"]
      case "mist":
      case "fog":
      case "haze":
        return isDark ? ["#3e5151", "#decba4", "#3e5151"] : ["#757f9a", "#d7dde8", "#757f9a"]
      default:
        return isDark ? ["#232526", "#414345", "#232526"] : ["#e0eafc", "#cfdef3", "#e0eafc"]
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  }

  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(deg / 45) % 8]
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "white",
                color: theme.textColor,
                borderColor: theme.borderColor,
              },
            ]}
            placeholder="Wpisz nazwę miasta..."
            placeholderTextColor={theme.secondaryTextColor}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.accentColor }]} onPress={handleSearch}>
            <Text style={styles.buttonText}>Szukaj</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.accentColor]}
              tintColor={theme.accentColor}
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.accentColor} />
              <Text style={[styles.loadingText, { color: theme.secondaryTextColor }]}>
                Pobieranie danych pogodowych...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="cloud-offline-outline" size={64} color={theme.errorColor} />
              <Text style={[styles.errorText, { color: theme.errorColor }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.accentColor }]}
                onPress={() => city && loadWeatherData(city)}
              >
                <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
              </TouchableOpacity>
            </View>
          ) : weather ? (
            <Animated.View style={[styles.weatherContainer, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={getWeatherBackground(weather.weather[0]?.main || "Clear") as any}
                style={styles.weatherCard}
              >
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={24} color="white" />
                  <Text style={styles.cityName}>
                    {weather.name}, {weather.sys.country}
                  </Text>
                </View>

                <View style={styles.mainWeather}>
                  {weather.weather[0]?.icon && (
                    <Image source={{ uri: getWeatherIcon(weather.weather[0].icon) }} style={styles.weatherIcon} />
                  )}
                  <Text style={styles.temperature}>{Math.round(weather.main.temp)}°C</Text>
                </View>

                <Text style={styles.description}>{weather.weather[0]?.description}</Text>

                <View style={styles.minMaxContainer}>
                  <View style={styles.minMaxItem}>
                    <Ionicons name="arrow-down" size={16} color="white" />
                    <Text style={styles.minMaxText}>Min: {Math.round(weather.main.temp_min)}°C</Text>
                  </View>
                  <View style={styles.minMaxItem}>
                    <Ionicons name="arrow-up" size={16} color="white" />
                    <Text style={styles.minMaxText}>Max: {Math.round(weather.main.temp_max)}°C</Text>
                  </View>
                </View>

                <View style={styles.sunTimesContainer}>
                  <View style={styles.sunTimeItem}>
                    <Ionicons name="sunny" size={24} color="white" />
                    <Text style={styles.sunTimeText}>Wschód: {formatTime(weather.sys.sunrise)}</Text>
                  </View>
                  <View style={styles.sunTimeItem}>
                    <Ionicons name="sunny" size={24} color="white" />
                    <Text style={styles.sunTimeText}>Zachód: {formatTime(weather.sys.sunset)}</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={[styles.detailsContainer, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.detailsTitle, { color: theme.textColor }]}>Szczegóły</Text>

                <View style={styles.detailsGrid}>
                  <View
                    style={[
                      styles.detailItem,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    ]}
                  >
                    <Ionicons name="thermometer-outline" size={24} color={theme.accentColor} />
                    <Text style={[styles.detailLabel, { color: theme.secondaryTextColor }]}>Odczuwalna</Text>
                    <Text style={[styles.detailValue, { color: theme.textColor }]}>
                      {Math.round(weather.main.feels_like)}°C
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailItem,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    ]}
                  >
                    <Ionicons name="water-outline" size={24} color={theme.accentColor} />
                    <Text style={[styles.detailLabel, { color: theme.secondaryTextColor }]}>Wilgotność</Text>
                    <Text style={[styles.detailValue, { color: theme.textColor }]}>{weather.main.humidity}%</Text>
                  </View>

                  <View
                    style={[
                      styles.detailItem,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    ]}
                  >
                    <Ionicons name="speedometer-outline" size={24} color={theme.accentColor} />
                    <Text style={[styles.detailLabel, { color: theme.secondaryTextColor }]}>Ciśnienie</Text>
                    <Text style={[styles.detailValue, { color: theme.textColor }]}>{weather.main.pressure} hPa</Text>
                  </View>

                  <View
                    style={[
                      styles.detailItem,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    ]}
                  >
                    <Ionicons name="eye-outline" size={24} color={theme.accentColor} />
                    <Text style={[styles.detailLabel, { color: theme.secondaryTextColor }]}>Widoczność</Text>
                    <Text style={[styles.detailValue, { color: theme.textColor }]}>
                      {(weather.visibility / 1000).toFixed(1)} km
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailItem,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    ]}
                  >
                    <Ionicons name="cloud-outline" size={24} color={theme.accentColor} />
                    <Text style={[styles.detailLabel, { color: theme.secondaryTextColor }]}>Zachmurzenie</Text>
                    <Text style={[styles.detailValue, { color: theme.textColor }]}>{weather.clouds.all}%</Text>
                  </View>

                  <View
                    style={[
                      styles.detailItem,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    ]}
                  >
                    <Ionicons name="compass-outline" size={24} color={theme.accentColor} />
                    <Text style={[styles.detailLabel, { color: theme.secondaryTextColor }]}>Wiatr</Text>
                    <Text style={[styles.detailValue, { color: theme.textColor }]}>
                      {Math.round(weather.wind.speed * 3.6)} km/h {getWindDirection(weather.wind.deg)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.updateTime, { color: theme.secondaryTextColor }]}>
                  Ostatnia aktualizacja: {new Date(weather.dt * 1000).toLocaleString("pl-PL")}
                </Text>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="partly-sunny-outline" size={64} color={theme.secondaryTextColor} />
              <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
                Wpisz nazwę miasta, aby zobaczyć aktualną pogodę
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    marginLeft: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    margin: 20,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
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
  weatherContainer: {
    padding: 16,
  },
  weatherCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  mainWeather: {
    alignItems: "center",
    marginVertical: 16,
  },
  weatherIcon: {
    width: 150,
    height: 150,
  },
  temperature: {
    fontSize: 72,
    fontWeight: "bold",
    color: "white",
  },
  description: {
    fontSize: 22,
    color: "white",
    textTransform: "capitalize",
    marginBottom: 16,
  },
  minMaxContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
  },
  minMaxItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  minMaxText: {
    color: "white",
    fontSize: 16,
    marginLeft: 4,
  },
  sunTimesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
  },
  sunTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  sunTimeText: {
    color: "white",
    fontSize: 14,
    marginLeft: 4,
  },
  detailsContainer: {
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  updateTime: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
})
