import { GestureHandlerRootView } from "react-native-gesture-handler"
import ClientLayout from "./ClientLayout"

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClientLayout />
    </GestureHandlerRootView>
  )
}
