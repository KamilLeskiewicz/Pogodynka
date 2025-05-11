import { NativeModules, Platform } from 'react-native'

const { WeatherWidgetModule } = NativeModules

export const useWeatherWidget = () => {
  const updateWidget = async (temperature: string, condition: string, city: string) => {
    if (Platform.OS === 'ios' && WeatherWidgetModule) {
      try {
        await WeatherWidgetModule.updateWidget(temperature, condition, city)
      } catch (error) {
        console.error('Failed to update widget:', error)
      }
    }
  }

  return { updateWidget }
} 