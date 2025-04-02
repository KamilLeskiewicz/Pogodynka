import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CurrentWeather {
  temperature: string;
  description: string;
}

interface ForecastItem {
  day: string;
  temperature: string;
  description: string;
}

const WeatherScreen: React.FC = () => {
  const [city, setCity] = useState<string>("");
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error("Błąd ładowania wyszukiwań:", error);
    }
  };

  const saveRecentSearch = async (cityName: string) => {
    try {
      const updatedSearches = [
        cityName,
        ...recentSearches.filter((item) => item !== cityName),
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(
        "recentSearches",
        JSON.stringify(updatedSearches)
      );
    } catch (error) {
      console.error("Błąd zapisywania wyszukiwania:", error);
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      Alert.alert("Uwaga", "Wprowadź nazwę miasta");
      return;
    }

    try {
      console.log("Pobieranie danych dla:", city);
      const simulatedCurrentWeather: CurrentWeather = {
        temperature: "20°C",
        description: "Słonecznie",
      };
      const simulatedForecast: ForecastItem[] = [
        {
          day: "Poniedziałek",
          temperature: "18°C",
          description: "Częściowo pochmurnie",
        },
        { day: "Wtorek", temperature: "22°C", description: "Słonecznie" },
        { day: "Środa", temperature: "19°C", description: "Deszczowo" },
        { day: "Czwartek", temperature: "21°C", description: "Słonecznie" },
        { day: "Piątek", temperature: "20°C", description: "Pochmurnie" },
        { day: "Sobota", temperature: "23°C", description: "Słonecznie" },
        { day: "Niedziela", temperature: "17°C", description: "Deszczowo" },
      ];

      setCurrentWeather(simulatedCurrentWeather);
      setForecast([...simulatedForecast]); // Wymuszenie aktualizacji stanu
      console.log("Nowy forecast:", simulatedForecast);
      saveRecentSearch(city);
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
      Alert.alert("Błąd", "Nie udało się pobrać danych");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Prognoza Pogody</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Wpisz nazwę miasta"
          value={city}
          onChangeText={setCity}
        />
        <Button title="Szukaj" onPress={fetchWeather} />
      </View>

      {currentWeather && (
        <View style={styles.currentWeatherContainer}>
          <Text style={styles.subHeader}>Aktualne warunki w {city}</Text>
          <Text>Temperatura: {currentWeather.temperature}</Text>
          <Text>Opis: {currentWeather.description}</Text>
        </View>
      )}

      {forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.subHeader}>Prognoza na najbliższy tydzień</Text>
          {forecast.map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.dayText}>{day.day}</Text>
              <Text>Temperatura: {day.temperature}</Text>
              <Text>Opis: {day.description}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginRight: 10,
  },
  currentWeatherContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  forecastContainer: { marginBottom: 20 },
  forecastItem: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dayText: { fontWeight: "bold" },
  subHeader: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
});

export default WeatherScreen;
