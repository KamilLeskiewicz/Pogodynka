import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTheme } from "../hooks/useTheme"

interface ForecastCardProps {
  title: string
  data: Array<{
    time: string
    temp: number
    icon: string
    description: string
  }>
  onPress?: () => void
}

export function ForecastCard({ title, data, onPress }: ForecastCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme } = useTheme()

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const renderItem = ({ item, index }: { item: typeof data[0]; index: number }) => (
    <View key={index} style={styles.forecastItem}>
      <Text style={[styles.time, { color: theme.textColor }]}>{item.time}</Text>
      <Ionicons name={item.icon as any} size={24} color={theme.textColor} />
      <Text style={[styles.temp, { color: theme.textColor }]}>{item.temp}°</Text>
      <Text style={[styles.description, { color: theme.secondaryTextColor }]}>
        {item.description}
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: theme.textColor }]}>{title}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.textColor}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
            scrollEnabled={true}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  time: {
    width: 60,
    fontSize: 14,
  },
  temp: {
    width: 50,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
}) 