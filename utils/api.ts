const API_KEY = "a012872e56416e2d157d8371ee9948f7"
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export interface WeatherData {
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
