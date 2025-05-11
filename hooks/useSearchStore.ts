import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface Location {
  name: string
  isFavorite: boolean
}

interface UserPreferences {
  defaultCity: string
  useMetricSystem: boolean
  showNotifications: boolean
  refreshInterval: number
}

interface SearchState {
  city: string | null
  searchHistory: string[]
  favorites: Array<{ name: string; timestamp: number }>
  preferences: UserPreferences
  weatherCache: {
    [key: string]: {
      data: any
      timestamp: number
    }
  }
  saveSearch: (cityName: string) => Promise<void>
  loadSearchHistory: () => Promise<void>
  removeFromHistory: (cityName: string) => Promise<void>
  toggleFavorite: (cityName: string) => Promise<void>
  loadFavorites: () => Promise<void>
  removeFavorite: (cityName: string) => Promise<void>
  setDefaultCity: (cityName: string) => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  loadPreferences: () => Promise<void>
  setWeatherCache: (city: string, data: any) => void
  getWeatherCache: (city: string) => any | null
  clearWeatherCache: () => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultCity: "Warsaw",
  useMetricSystem: true,
  showNotifications: true,
  refreshInterval: 30,
}

const CACHE_DURATION = 5 * 60 * 1000 

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      city: null,
      searchHistory: [],
      favorites: [],
      preferences: DEFAULT_PREFERENCES,
      weatherCache: {},

      saveSearch: async (cityName: string) => {
        try {
          const { searchHistory } = get()
          const newHistory = [cityName, ...searchHistory.filter((c) => c !== cityName)].slice(0, 10)
          set({ city: cityName, searchHistory: newHistory })
          await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory))
        } catch (error) {
          console.error("Failed to save search", error)
        }
      },

      loadSearchHistory: async () => {
        try {
          const history = await AsyncStorage.getItem("searchHistory")
          if (history) {
            set({ searchHistory: JSON.parse(history) })
          }

          // Load favorites and preferences
          await get().loadFavorites()
          await get().loadPreferences()
        } catch (error) {
          console.error("Failed to load search history", error)
        }
      },

      removeFromHistory: async (cityName: string) => {
        try {
          const { searchHistory } = get()
          const newHistory = searchHistory.filter(city => city !== cityName)
          set({ searchHistory: newHistory })
          await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory))
        } catch (error) {
          console.error("Failed to remove from history", error)
        }
      },

      toggleFavorite: async (cityName: string) => {
        try {
          const { favorites } = get()
          let newFavorites: Array<{ name: string; timestamp: number }> = []

          const existingIndex = favorites.findIndex((fav) => fav.name === cityName)

          if (existingIndex >= 0) {
            newFavorites = favorites.filter((fav) => fav.name !== cityName)
          } else {
            newFavorites = [...favorites, { name: cityName, timestamp: Date.now() }]
          }

          set({ favorites: newFavorites })
          await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites))
        } catch (error) {
          console.error("Failed to toggle favorite", error)
        }
      },

      loadFavorites: async () => {
        try {
          const favoritesData = await AsyncStorage.getItem("favorites")
          if (favoritesData) {
            set({ favorites: JSON.parse(favoritesData) })
          }
        } catch (error) {
          console.error("Failed to load favorites", error)
        }
      },

      removeFavorite: async (cityName: string) => {
        try {
          const { favorites } = get()
          const newFavorites = favorites.filter((fav) => fav.name !== cityName)
          set({ favorites: newFavorites })
          await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites))
        } catch (error) {
          console.error("Failed to remove favorite", error)
        }
      },

      setDefaultCity: async (cityName: string) => {
        try {
          const { preferences } = get()
          const newPreferences = { ...preferences, defaultCity: cityName }
          set({ preferences: newPreferences, city: cityName })
          await AsyncStorage.setItem("preferences", JSON.stringify(newPreferences))
        } catch (error) {
          console.error("Failed to set default city", error)
        }
      },

      updatePreferences: async (newPreferences: Partial<UserPreferences>) => {
        try {
          const { preferences } = get()
          const updatedPreferences = { ...preferences, ...newPreferences }
          set({ preferences: updatedPreferences })
          await AsyncStorage.setItem("preferences", JSON.stringify(updatedPreferences))
        } catch (error) {
          console.error("Failed to update preferences", error)
        }
      },

      loadPreferences: async () => {
        try {
          const preferencesData = await AsyncStorage.getItem("preferences")
          if (preferencesData) {
            const loadedPreferences = JSON.parse(preferencesData)
            set({ 
              preferences: loadedPreferences,
              city: loadedPreferences.defaultCity || "Warsaw"
            })
          }
        } catch (error) {
          console.error("Failed to load preferences", error)
        }
      },

      setWeatherCache: (city: string, data: any) => {
        set((state) => ({
          weatherCache: {
            ...state.weatherCache,
            [city]: {
              data,
              timestamp: Date.now(),
            },
          },
        }))
      },

      getWeatherCache: (city: string) => {
        const cache = get().weatherCache[city]
        if (!cache) return null

        const isExpired = Date.now() - cache.timestamp > CACHE_DURATION
        if (isExpired) {
          set((state) => {
            const newCache = { ...state.weatherCache }
            delete newCache[city]
            return { weatherCache: newCache }
          })
          return null
        }

        return cache.data
      },

      clearWeatherCache: () => {
        set({ weatherCache: {} })
      },
    }),
    {
      name: "weather-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        favorites: state.favorites,
        preferences: state.preferences,
      }),
    }
  )
)
