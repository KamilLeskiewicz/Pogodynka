const API_KEY = "a012872e56416e2d157d8371ee9948f7"
const BASE_URL = "https://api.openweathermap.org/data/2.5"
const AQI_BASE_URL = "https://api.openweathermap.org/data/2.5/air_pollution"

export interface WeatherData {
  name: string
  coord: {
    lat: number
    lon: number
  }
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  weather: Array<{
    description: string
    icon: string
    main: string
    id: number
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

export interface AirQualityData {
  list: Array<{
    main: {
      aqi: number
    }
    components: {
      co: number
      no: number
      no2: number
      o3: number
      so2: number
      pm2_5: number
      pm10: number
      nh3: number
    }
    dt: number
  }>
}

export interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      humidity: number
      pressure: number
      temp_min: number
      temp_max: number
    }
    weather: Array<{
      description: string
      icon: string
      main: string
      id: number
    }>
    wind: {
      speed: number
      deg: number
    }
    clouds: {
      all: number
    }
    visibility: number
    pop: number
    sys: {
      pod: string
    }
    dt_txt: string
  }>
  city: {
    name: string
    country: string
    sunrise: number
    sunset: number
  }
}

export interface HourlyForecastItem {
  dt: number
  dt_txt: string
  temp: number
  feels_like: number
  weather: {
    description: string
    icon: string
    main: string
  }
  pop: number
  humidity: number
  wind_speed: number
}

export const fetchCurrentWeather = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=pl&appid=${API_KEY}`)

    if (!response.ok) {
      throw new Error("City not found")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching current weather:", error)
    throw error
  }
}

export const fetchAirQuality = async (city: string): Promise<AirQualityData> => {
  try {
    // First get coordinates for the city
    const weatherData = await fetchCurrentWeather(city)
    const { lat, lon } = weatherData.coord

    // Then fetch air quality data
    const response = await fetch(
      `${AQI_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch air quality data")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching air quality:", error)
    throw error
  }
}

export const getAQIDescription = (aqi: number): { label: string; color: string } => {
  switch (aqi) {
    case 1:
      return { label: "Dobra", color: "#00C853" }
    case 2:
      return { label: "Umiarkowana", color: "#FFD600" }
    case 3:
      return { label: "Niezdrowa dla wrażliwych", color: "#FF9100" }
    case 4:
      return { label: "Niezdrowa", color: "#FF3D00" }
    case 5:
      return { label: "Bardzo niezdrowa", color: "#C51162" }
    default:
      return { label: "Nieznana", color: "#757575" }
  }
}

export const fetchWeeklyForecast = async (city: string): Promise<ForecastData> => {
  try {
    const response = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&lang=pl&appid=${API_KEY}`)

    if (!response.ok) {
      throw new Error("City not found")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching forecast:", error)
    throw error
  }
}

export const fetchHourlyForecast = async (city: string): Promise<HourlyForecastItem[]> => {
  try {
    const data = await fetchWeeklyForecast(city)

    const hourlyItems = data.list.slice(0, 8).map((item) => ({
      dt: item.dt,
      dt_txt: item.dt_txt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      weather: {
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        main: item.weather[0].main,
      },
      pop: item.pop,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
    }))

    return hourlyItems
  } catch (error) {
    console.error("Error fetching hourly forecast:", error)
    throw error
  }
}
