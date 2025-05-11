"use client"

import { useRouter } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { WebView } from "react-native-webview"
import { useSearchStore } from "../../hooks/useSearchStore"
import { useTheme } from "../../hooks/useTheme"

export default function WeatherMapScreen() {
  const { theme, isDark } = useTheme()
  const router = useRouter()
  const { city } = useSearchStore()
  const [loading, setLoading] = useState(true)

  const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&zoom=10`

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Mapa pogodowa</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentColor} />
          <Text style={[styles.loadingText, { color: theme.secondaryTextColor }]}>
            Ładowanie mapy...
          </Text>
        </View>
      )}

      <WebView
        source={{ uri: mapUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
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
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}) 