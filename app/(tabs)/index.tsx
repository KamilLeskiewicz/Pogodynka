"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
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
  View
} from "react-native"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"
import { useWeatherWidget } from "../../hooks/useWeatherWidget"
import { fetchCurrentWeather, fetchHourlyForecast, type HourlyForecastItem } from "../../utils/api"

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
  coord: {
    lat: number
    lon: number
  }
}

const convertTemperature = (celsius: number, useMetricSystem: boolean): number => {
  if (useMetricSystem) return celsius
  return (celsius * 9) / 5 + 32
}

const getWeatherAnimation = (weatherMain: string): string => {
  switch (weatherMain.toLowerCase()) {
    case "clear":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    case "clouds":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    case "rain":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    case "drizzle":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    case "thunderstorm":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    case "snow":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    case "mist":
    case "fog":
    case "haze":
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
    default:
      return "https://assets2.lottiefiles.com/packages/lf20_2cwDXD.json"
  }
}

export default function CurrentWeatherScreen() {
  const { city, saveSearch, favorites, toggleFavorite, preferences, setWeatherCache, getWeatherCache } = useSearchStore()
  const [searchText, setSearchText] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { theme, isDark } = useTheme()
  const router = useRouter()
  const { updateWidget } = useWeatherWidget()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const hourlyFadeAnim = useRef(new Animated.Value(0)).current
  const detailsFadeAnim = useRef(new Animated.Value(0)).current

  const formatTemperature = useCallback((temp: number) => {
    const convertedTemp = convertTemperature(temp, preferences.useMetricSystem)
    return `${Math.round(convertedTemp)}°${preferences.useMetricSystem ? "C" : "F"}`
  }, [preferences.useMetricSystem])

  const loadWeatherData = useCallback(async (cityName: string) => {
    setLoading(true)
    setError(null)

    fadeAnim.setValue(0)
    slideAnim.setValue(50)
    hourlyFadeAnim.setValue(0)
    detailsFadeAnim.setValue(0)

    try {
      const cachedData = getWeatherCache(cityName)
      if (cachedData) {
        setWeather(cachedData.weather)
        setHourlyForecast(cachedData.hourly)
        setLoading(false)
        return
      }

      const [weatherData, hourlyData] = await Promise.all([
        fetchCurrentWeather(cityName),
        fetchHourlyForecast(cityName)
      ])

      setWeather(weatherData)
      setHourlyForecast(hourlyData)

      setWeatherCache(cityName, {
        weather: weatherData,
        hourly: hourlyData
      })
    } catch (err) {
      setError("Nie udało się pobrać danych pogodowych. Sprawdź nazwę miasta.")
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [fadeAnim, slideAnim, hourlyFadeAnim, detailsFadeAnim, getWeatherCache, setWeatherCache])

  useEffect(() => {
    if (city) {
      loadWeatherData(city)
    }
  }, [city, loadWeatherData])

  useEffect(() => {
    const updateWidgetData = async () => {
      if (weather) {
        try {
          await updateWidget(
            formatTemperature(weather.main.temp),
            weather.weather[0]?.description || "",
            weather.name
          )
        } catch (error) {
          console.error('Failed to update widget:', error)
        }
      }
    }

    updateWidgetData()
  }, [weather, formatTemperature, updateWidget])

  const handleSearch = useCallback(() => {
    if (searchText.trim()) {
      saveSearch(searchText.trim())
      setSearchText("")
    }
  }, [searchText, saveSearch])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    if (city) {
      loadWeatherData(city)
    }
  }, [city, loadWeatherData])

  const handleToggleFavorite = useCallback(() => {
    if (city) {
      toggleFavorite(city)
    }
  }, [city, toggleFavorite])

  const renderHourlyItem = useCallback(({ item }: { item: HourlyForecastItem }) => {
    return (
      <View style={[styles.hourlyItem, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.hourlyTime, { color: theme.textColor }]}>{formatHourlyTime(item.dt_txt)}</Text>
        <Text style={[styles.hourlyDate, { color: theme.secondaryTextColor }]}>{formatHourlyDate(item.dt_txt)}</Text>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${item.weather.icon}@2x.png` }}
          style={styles.hourlyIcon}
        />
        <Text style={[styles.hourlyTemp, { color: theme.textColor }]}>
          {formatTemperature(item.temp)}
        </Text>
        <View style={styles.hourlyDetailRow}>
          <Ionicons name="water-outline" size={12} color={theme.secondaryTextColor} />
          <Text style={[styles.hourlyDetailText, { color: theme.secondaryTextColor }]}>{item.humidity}%</Text>
        </View>
        <View style={styles.hourlyDetailRow}>
          <Ionicons name="rainy-outline" size={12} color={theme.secondaryTextColor} />
          <Text style={[styles.hourlyDetailText, { color: theme.secondaryTextColor }]}>
            {Math.round(item.pop * 100)}%
          </Text>
        </View>
      </View>
    )
  }, [theme, formatTemperature])

  useEffect(() => {
    if (weather) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        Animated.timing(hourlyFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          delay: 100,
        }),
        Animated.timing(detailsFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [weather])

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  }

  const formatHourlyTime = (dtTxt: string) => {
    const date = new Date(dtTxt)
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  }

  const formatHourlyDate = (dtTxt: string) => {
    const date = new Date(dtTxt)
    return date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" })
  }

  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(deg / 45) % 8]
  }

  const isFavorite = () => {
    return favorites.some((fav) => fav.name === city)
  }

  const openWeatherMap = () => {
    router.push("/map")
  }

  const renderWeatherIcon = () => {
    if (!weather?.weather[0]?.icon) return null

    return (
      <Image 
        source={{ uri: getWeatherIcon(weather.weather[0].icon) }} 
        style={styles.weatherIcon} 
      />
    )
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
          showsVerticalScrollIndicator={false}
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
            <View style={styles.weatherContainer}>
              <Animated.View
                style={[
                  styles.weatherCard,
                  {
                    backgroundColor: getWeatherColor(weather.weather[0]?.main || "Clear"),
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={24} color="white" />
                  <Text style={styles.cityName}>
                    {weather.name}, {weather.sys.country}
                  </Text>
                  <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                    <Ionicons
                      name={isFavorite() ? "star" : "star-outline"}
                      size={24}
                      color={isFavorite() ? "#FFD700" : "white"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.mainWeather}>
                  {renderWeatherIcon()}
                  <Text style={styles.temperature}>{formatTemperature(weather.main.temp)}</Text>
                </View>

                <Text style={styles.description}>{weather.weather[0]?.description}</Text>

                <View style={styles.minMaxContainer}>
                  <View style={styles.minMaxItem}>
                    <Ionicons name="arrow-down" size={16} color="white" />
                    <Text style={styles.minMaxText}>Min: {formatTemperature(weather.main.temp_min)}</Text>
                  </View>
                  <View style={styles.minMaxItem}>
                    <Ionicons name="arrow-up" size={16} color="white" />
                    <Text style={styles.minMaxText}>Max: {formatTemperature(weather.main.temp_max)}</Text>
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

                <TouchableOpacity 
                  style={styles.mapButton} 
                  onPress={openWeatherMap}
                >
                  <Ionicons name="map-outline" size={24} color="white" />
                  <Text style={styles.mapButtonText}>Otwórz mapę pogodową</Text>
                </TouchableOpacity>
              </Animated.View>

              {hourlyForecast.length > 0 && (
                <Animated.View
                  style={[
                    styles.hourlyContainer,
                    {
                      backgroundColor: theme.cardBackground,
                      opacity: hourlyFadeAnim,
                    },
                  ]}
                >
                  <Text style={[styles.hourlyTitle, { color: theme.textColor }]}>Prognoza godzinowa</Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={hourlyForecast}
                    renderItem={renderHourlyItem}
                    keyExtractor={(item) => item.dt.toString()}
                    contentContainerStyle={styles.hourlyList}
                  />
                </Animated.View>
              )}

              <Animated.View
                style={[
                  styles.detailsContainer,
                  {
                    backgroundColor: theme.cardBackground,
                    opacity: detailsFadeAnim,
                  },
                ]}
              >
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
                      {formatTemperature(weather.main.feels_like)}
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
              </Animated.View>
            </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  cityName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
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
  hourlyContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hourlyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  hourlyList: {
    paddingVertical: 8,
  },
  hourlyItem: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    width: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hourlyTime: {
    fontSize: 16,
    fontWeight: "bold",
  },
  hourlyDate: {
    fontSize: 12,
    marginBottom: 8,
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
  detailsContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})
