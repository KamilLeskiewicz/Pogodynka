import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"

interface SearchState {
  city: string
  searchHistory: string[]
  saveSearch: (cityName: string) => Promise<void>
  loadSearchHistory: () => Promise<void>
}

export const useSearchStore = create<SearchState>((set, get) => ({
  city: "Warsaw",
  searchHistory: [],

  saveSearch: async (cityName: string) => {
    try {
      const { searchHistory } = get()
      if (!searchHistory.includes(cityName)) {
        const newHistory = [cityName, ...searchHistory.slice(0, 9)]
        set({ city: cityName, searchHistory: newHistory })
        await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory))
      } else {
        set({ city: cityName })
      }
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
    } catch (error) {
      console.error("Failed to load search history", error)
    }
  },
}))
