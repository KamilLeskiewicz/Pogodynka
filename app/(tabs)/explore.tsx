"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"
import { fetchWeeklyForecast, type ForecastData } from "../../utils/api"

interface DailyForecast {
  date: string
  weather: {
    description: string
    icon: string
    main: string
  }
  temp: {
    min: number
    max: number
    day: number
    night: number
    eve: number
    morn: number
  }
  humidity: number
  wind: number
  pressure: number
  clouds: number
  pop: number
  visibility: number
  sunrise?: number
  sunset?: number
  expanded: boolean
}

const { width } = Dimensions.get("window")

export default function ForecastScreen() {
  const { city } = useSearchStore()
  const [forecast, setForecast] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { theme, isDark } = useTheme()

  useEffect(() => {
    if (city) {
      loadForecastData(city)
    }
  }, [city])

  const loadForecastData = async (cityName: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeeklyForecast(cityName)

      const dailyData = groupForecastByDay(data.list)
      setForecast(dailyData)
    } catch (err) {
      setError("Nie udało się pobrać prognozy. Sprawdź nazwę miasta.")
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    if (city) {
      loadForecastData(city)
    }
  }

  const groupForecastByDay = (forecastList: ForecastData["list"]): DailyForecast[] => {
    const grouped: Record<string, DailyForecast> = {}

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const day = date.toLocaleDateString("pl-PL", { weekday: "long", month: "long", day: "numeric" })
      const hour = date.getHours()

      if (!grouped[day]) {
        grouped[day] = {
          date: day,
          weather: {
            ...item.weather[0],
            main: item.weather[0].main || "",
          },
          temp: {
            min: item.main.temp,
            max: item.main.temp,
            day: hour >= 6 && hour < 18 ? item.main.temp : 0,
            night: hour >= 18 || hour < 6 ? item.main.temp : 0,
            eve: hour >= 16 && hour < 22 ? item.main.temp : 0,
            morn: hour >= 4 && hour < 10 ? item.main.temp : 0,
          },
          humidity: item.main.humidity,
          wind: item.wind.speed,
          pressure: item.main.pressure,
          clouds: item.clouds?.all || 0,
          pop: item.pop || 0,
          visibility: item.visibility || 0,
          expanded: false,
        }
      } else {
        grouped[day].temp.min = Math.min(grouped[day].temp.min, item.main.temp)
        grouped[day].temp.max = Math.max(grouped[day].temp.max, item.main.temp)

        if (hour >= 6 && hour < 18) {
          grouped[day].temp.day = item.main.temp
        }
        if (hour >= 18 || hour < 6) {
          grouped[day].temp.night = item.main.temp
        }
        if (hour >= 16 && hour < 22) {
          grouped[day].temp.eve = item.main.temp
        }
        if (hour >= 4 && hour < 10) {
          grouped[day].temp.morn = item.main.temp
        }
      }
    })

    return Object.values(grouped)
  }

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
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

  const toggleExpand = (index: number) => {
    const newForecast = [...forecast]
    newForecast[index].expanded = !newForecast[index].expanded
    setForecast(newForecast)
  }

  const renderForecastItem = ({ item, index }: { item: DailyForecast; index: number }) => {
    const weatherMain = item.weather.main || "Clear"
    const gradientColors = getWeatherBackground(weatherMain)

    return (
      <Animated.View style={styles.forecastItemContainer}>
        <LinearGradient
          colors={gradientColors as any}
          style={[styles.forecastItem, { backgroundColor: theme.cardBackground }]}
        >
          <TouchableOpacity style={styles.forecastHeader} onPress={() => toggleExpand(index)} activeOpacity={0.8}>
            <View style={styles.dayContainer}>
              <Text style={[styles.dayText, { color: theme.textColor }]}>{item.date}</Text>
              <View style={styles.weatherIconContainer}>
                <Image source={{ uri: getWeatherIcon(item.weather.icon) }} style={styles.weatherIcon} />
                <Text style={[styles.description, { color: theme.textColor }]}>{item.weather.description}</Text>
              </View>
            </View>

            <View style={styles.tempContainer}>
              <Text style={styles.maxTemp}>{Math.round(item.temp.max)}°</Text>
              <Text style={styles.minTemp}>{Math.round(item.temp.min)}°</Text>
              <Ionicons name={item.expanded ? "chevron-up" : "chevron-down"} size={24} color={theme.textColor} />
            </View>
          </TouchableOpacity>

          {item.expanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />

              <View style={styles.temperatureSection}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Temperatura</Text>
                <View style={styles.tempDetails}>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="sunny-outline" size={20} color={theme.textColor} />
                    <Text style={[styles.tempDetailLabel, { color: theme.textColor }]}>Dzień</Text>
                    <Text style={[styles.tempDetailValue, { color: theme.textColor }]}>
                      {Math.round(item.temp.day || item.temp.max)}°C
                    </Text>
                  </View>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="moon-outline" size={20} color={theme.textColor} />
                    <Text style={[styles.tempDetailLabel, { color: theme.textColor }]}>Noc</Text>
                    <Text style={[styles.tempDetailValue, { color: theme.textColor }]}>
                      {Math.round(item.temp.night || item.temp.min)}°C
                    </Text>
                  </View>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="partly-sunny-outline" size={20} color={theme.textColor} />
                    <Text style={[styles.tempDetailLabel, { color: theme.textColor }]}>Rano</Text>
                    <Text style={[styles.tempDetailValue, { color: theme.textColor }]}>
                      {Math.round(item.temp.morn || item.temp.min)}°C
                    </Text>
                  </View>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="sunny-outline" size={20} color={theme.textColor} />
                    <Text style={[styles.tempDetailLabel, { color: theme.textColor }]}>Wieczór</Text>
                    <Text style={[styles.tempDetailValue, { color: theme.textColor }]}>
                      {Math.round(item.temp.eve || item.temp.max)}°C
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailGridItem}>
                  <Ionicons name="water-outline" size={24} color={theme.textColor} />
                  <Text style={[styles.detailGridLabel, { color: theme.textColor }]}>Wilgotność</Text>
                  <Text style={[styles.detailGridValue, { color: theme.textColor }]}>{item.humidity}%</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="speedometer-outline" size={24} color={theme.textColor} />
                  <Text style={[styles.detailGridLabel, { color: theme.textColor }]}>Ciśnienie</Text>
                  <Text style={[styles.detailGridValue, { color: theme.textColor }]}>{item.pressure} hPa</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="cloud-outline" size={24} color={theme.textColor} />
                  <Text style={[styles.detailGridLabel, { color: theme.textColor }]}>Zachmurzenie</Text>
                  <Text style={[styles.detailGridValue, { color: theme.textColor }]}>{item.clouds}%</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="eye-outline" size={24} color={theme.textColor} />
                  <Text style={[styles.detailGridLabel, { color: theme.textColor }]}>Widoczność</Text>
                  <Text style={[styles.detailGridValue, { color: theme.textColor }]}>
                    {(item.visibility / 1000).toFixed(1)} km
                  </Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="rainy-outline" size={24} color={theme.textColor} />
                  <Text style={[styles.detailGridLabel, { color: theme.textColor }]}>Opady</Text>
                  <Text style={[styles.detailGridValue, { color: theme.textColor }]}>
                    {Math.round(item.pop * 100)}%
                  </Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="compass-outline" size={24} color={theme.textColor} />
                  <Text style={[styles.detailGridLabel, { color: theme.textColor }]}>Wiatr</Text>
                  <Text style={[styles.detailGridValue, { color: theme.textColor }]}>
                    {Math.round(item.wind * 3.6)} km/h
                  </Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Prognoza tygodniowa</Text>
        <Text style={[styles.cityName, { color: theme.secondaryTextColor }]}>{city}</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text style={[styles.loadingText, { color: theme.secondaryTextColor }]}>Pobieranie prognozy...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={theme.errorColor} />
          <Text style={[styles.errorText, { color: theme.errorColor }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accentColor }]}
            onPress={() => city && loadForecastData(city)}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : forecast.length > 0 ? (
        <FlatList
          data={forecast}
          renderItem={renderForecastItem}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1DA1F2"]}
              tintColor={theme.accentColor}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.secondaryTextColor} />
          <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>Brak danych prognozy</Text>
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
  cityName: {
    fontSize: 16,
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 12,
  },
  forecastItemContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  forecastItem: {
    borderRadius: 16,
    overflow: "hidden",
  },
  forecastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dayContainer: {
    flex: 1,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  weatherIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  weatherIcon: {
    width: 40,
    height: 40,
  },
  description: {
    fontSize: 16,
    textTransform: "capitalize",
    marginLeft: 4,
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  maxTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginRight: 8,
  },
  minTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginRight: 12,
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 12,
  },
  temperatureSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tempDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tempDetailItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 8,
  },
  tempDetailLabel: {
    marginLeft: 8,
    flex: 1,
  },
  tempDetailValue: {
    fontWeight: "bold",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailGridItem: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  detailGridLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  detailGridValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "bold",
  },
})
