"use client"

import { Stack } from "expo-router"
import { useEffect } from "react"
import { useSearchStore } from "../hooks/useSearchStore"
import { ThemeProvider } from "../hooks/useTheme"

export default function ClientLayout() {
  const { loadSearchHistory } = useSearchStore()

  useEffect(() => {
    loadSearchHistory()
  }, [])

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  )
}
