"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"
import { fetchHourlyForecast, fetchWeeklyForecast, type ForecastData, type HourlyForecastItem } from "../../utils/api"

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
  hourlyData?: HourlyForecastItem[]
}

const { width } = Dimensions.get("window")

export default function ForecastScreen() {
  const { city } = useSearchStore()
  const [forecast, setForecast] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { theme, isDark } = useTheme()


  const fadeAnim = useRef(new Animated.Value(0)).current
  const expandAnims = useRef<{ [key: string]: Animated.Value }>({}).current

  useEffect(() => {
    if (city) {
      loadForecastData(city)
    }
  }, [city])

  useEffect(() => {
    if (forecast.length > 0 && !loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start()
    } else {
      fadeAnim.setValue(0)
    }
  }, [forecast, loading])

  const loadForecastData = async (cityName: string) => {
    setLoading(true)
    setError(null)
    fadeAnim.setValue(0)

    try {
      const data = await fetchWeeklyForecast(cityName)
      const hourlyData = await fetchHourlyForecast(cityName)

      const dailyData = groupForecastByDay(data.list, hourlyData)

      dailyData.forEach((item) => {
        if (!expandAnims[item.date]) {
          expandAnims[item.date] = new Animated.Value(0)
        }
      })

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

  const groupForecastByDay = (
    forecastList: ForecastData["list"],
    hourlyData: HourlyForecastItem[],
  ): DailyForecast[] => {
    const grouped: Record<string, DailyForecast> = {}

    const hourlyByDay: Record<string, HourlyForecastItem[]> = {}
    hourlyData.forEach((item) => {
      const date = new Date(item.dt_txt)
      const day = date.toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" })

      if (!hourlyByDay[day]) {
        hourlyByDay[day] = []
      }

      hourlyByDay[day].push(item)
    })

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const day = date.toLocaleDateString("pl-PL", { weekday: "long", month: "long", day: "numeric" })
      const shortDay = date.toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" })
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
          hourlyData: hourlyByDay[shortDay] || [],
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

  const getWeatherColor = (weatherMain: string): string => {
    switch (weatherMain.toLowerCase()) {
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

  const toggleExpand = (index: number) => {
    const newForecast = [...forecast]
    const item = newForecast[index]
    const isExpanding = !item.expanded

    item.expanded = isExpanding
    setForecast(newForecast)

    Animated.timing(expandAnims[item.date], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start()
  }

  const formatHourlyTime = (dtTxt: string) => {
    const date = new Date(dtTxt)
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  }

  const renderHourlyItem = ({ item }: { item: HourlyForecastItem }) => {
    return (
      <View style={[styles.hourlyItem, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
        <Text style={[styles.hourlyTime, { color: "white" }]}>{formatHourlyTime(item.dt_txt)}</Text>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${item.weather.icon}@2x.png` }}
          style={styles.hourlyIcon}
        />
        <Text style={[styles.hourlyTemp, { color: "white" }]}>{Math.round(item.temp)}°C</Text>
        <View style={styles.hourlyDetailRow}>
          <Ionicons name="water-outline" size={12} color="white" />
          <Text style={[styles.hourlyDetailText, { color: "white" }]}>{item.humidity}%</Text>
        </View>
        <View style={styles.hourlyDetailRow}>
          <Ionicons name="rainy-outline" size={12} color="white" />
          <Text style={[styles.hourlyDetailText, { color: "white" }]}>{Math.round(item.pop * 100)}%</Text>
        </View>
      </View>
    )
  }

  const renderForecastItem = ({ item, index }: { item: DailyForecast; index: number }) => {
    const weatherMain = item.weather.main || "Clear"
    const backgroundColor = getWeatherColor(weatherMain)

    const expandHeight =
      expandAnims[item.date]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, item.hourlyData && item.hourlyData.length > 0 ? 500 : 400],
        extrapolate: "clamp",
      }) || new Animated.Value(0)

    const rotateAnim =
      expandAnims[item.date]?.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }) || new Animated.Value(0)

    return (
      <Animated.View
        style={[
          styles.forecastItemContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          },
        ]}
      >
        <View style={[styles.forecastItem, { backgroundColor }]}>
          <TouchableOpacity style={styles.forecastHeader} onPress={() => toggleExpand(index)} activeOpacity={0.8}>
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>{item.date}</Text>
              <View style={styles.weatherIconContainer}>
                <Image source={{ uri: getWeatherIcon(item.weather.icon) }} style={styles.weatherIcon} />
                <Text style={styles.description}>{item.weather.description}</Text>
              </View>
            </View>

            <View style={styles.tempContainer}>
              <Text style={styles.maxTemp}>{Math.round(item.temp.max)}°</Text>
              <Text style={styles.minTemp}>{Math.round(item.temp.min)}°</Text>
              <Animated.View style={{ transform: [{ rotate: rotateAnim }] }}>
                <Ionicons name="chevron-down" size={24} color="white" />
              </Animated.View>
            </View>
          </TouchableOpacity>

          <Animated.View style={[styles.expandedContentWrapper, { height: expandHeight }]}>
            <View style={styles.expandedContent}>
              <View style={styles.divider} />

              {item.hourlyData && item.hourlyData.length > 0 && (
                <View style={styles.hourlyContainer}>
                  <Text style={styles.sectionTitle}>Prognoza godzinowa</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hourlyList}
                  >
                    {item.hourlyData.map((hourlyItem) => (
                      <View key={hourlyItem.dt} style={styles.hourlyItemWrapper}>
                        {renderHourlyItem({ item: hourlyItem })}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.temperatureSection}>
                <Text style={styles.sectionTitle}>Temperatura</Text>
                <View style={styles.tempDetails}>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="sunny-outline" size={20} color="white" />
                    <Text style={styles.tempDetailLabel}>Dzień</Text>
                    <Text style={styles.tempDetailValue}>{Math.round(item.temp.day || item.temp.max)}°C</Text>
                  </View>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="moon-outline" size={20} color="white" />
                    <Text style={styles.tempDetailLabel}>Noc</Text>
                    <Text style={styles.tempDetailValue}>{Math.round(item.temp.night || item.temp.min)}°C</Text>
                  </View>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="partly-sunny-outline" size={20} color="white" />
                    <Text style={styles.tempDetailLabel}>Rano</Text>
                    <Text style={styles.tempDetailValue}>{Math.round(item.temp.morn || item.temp.min)}°C</Text>
                  </View>
                  <View style={styles.tempDetailItem}>
                    <Ionicons name="sunny-outline" size={20} color="white" />
                    <Text style={styles.tempDetailLabel}>Wieczór</Text>
                    <Text style={styles.tempDetailValue}>{Math.round(item.temp.eve || item.temp.max)}°C</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailGridItem}>
                  <Ionicons name="water-outline" size={24} color="white" />
                  <Text style={styles.detailGridLabel}>Wilgotność</Text>
                  <Text style={styles.detailGridValue}>{item.humidity}%</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="speedometer-outline" size={24} color="white" />
                  <Text style={styles.detailGridLabel}>Ciśnienie</Text>
                  <Text style={styles.detailGridValue}>{item.pressure} hPa</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="cloud-outline" size={24} color="white" />
                  <Text style={styles.detailGridLabel}>Zachmurzenie</Text>
                  <Text style={styles.detailGridValue}>{item.clouds}%</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="eye-outline" size={24} color="white" />
                  <Text style={styles.detailGridLabel}>Widoczność</Text>
                  <Text style={styles.detailGridValue}>{(item.visibility / 1000).toFixed(1)} km</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="rainy-outline" size={24} color="white" />
                  <Text style={styles.detailGridLabel}>Opady</Text>
                  <Text style={styles.detailGridValue}>{Math.round(item.pop * 100)}%</Text>
                </View>

                <View style={styles.detailGridItem}>
                  <Ionicons name="compass-outline" size={24} color="white" />
                  <Text style={styles.detailGridLabel}>Wiatr</Text>
                  <Text style={styles.detailGridValue}>{Math.round(item.wind * 3.6)} km/h</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
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
          <ActivityIndicator size="large" color={theme.accentColor} />
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
              colors={[theme.accentColor]}
              tintColor={theme.accentColor}
            />
          }
          showsVerticalScrollIndicator={false}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    color: "white",
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
    color: "white",
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  maxTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginRight: 8,
  },
  minTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.7)",
    marginRight: 12,
  },
  expandedContentWrapper: {
    overflow: "hidden",
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
  hourlyContainer: {
    marginBottom: 16,
  },
  hourlyList: {
    paddingVertical: 8,
  },
  hourlyItemWrapper: {
    marginRight: 12,
  },
  hourlyItem: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: 90,
  },
  hourlyTime: {
    fontSize: 16,
    fontWeight: "bold",
  },
  hourlyIcon: {
    width: 50,
    height: 50,
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },
  hourlyDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  hourlyDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  temperatureSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "white",
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
    color: "white",
  },
  tempDetailValue: {
    fontWeight: "bold",
    color: "white",
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
    color: "white",
  },
  detailGridValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
})
