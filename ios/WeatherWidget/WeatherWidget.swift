import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WeatherEntry {
        WeatherEntry(date: Date(), temperature: "21°C", condition: "Sunny", city: "Warsaw")
    }

    func getSnapshot(in context: Context, completion: @escaping (WeatherEntry) -> ()) {
        if let weatherData = WeatherDataService.shared.getWeatherData() {
            let entry = WeatherEntry(
                date: weatherData.timestamp,
                temperature: weatherData.temperature,
                condition: weatherData.condition,
                city: weatherData.city
            )
            completion(entry)
        } else {
            let entry = WeatherEntry(date: Date(), temperature: "21°C", condition: "Sunny", city: "Warsaw")
            completion(entry)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [WeatherEntry] = []
        let currentDate = Date()
        
        if let weatherData = WeatherDataService.shared.getWeatherData() {
            let entry = WeatherEntry(
                date: weatherData.timestamp,
                temperature: weatherData.temperature,
                condition: weatherData.condition,
                city: weatherData.city
            )
            entries.append(entry)
        } else {
            let entry = WeatherEntry(date: currentDate, temperature: "21°C", condition: "Sunny", city: "Warsaw")
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .after(currentDate.addingTimeInterval(3600)))
        completion(timeline)
    }
}

struct WeatherEntry: TimelineEntry {
    let date: Date
    let temperature: String
    let condition: String
    let city: String
}

struct WeatherWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack {
            Text(entry.city)
                .font(.headline)
            Text(entry.temperature)
                .font(.title)
            Text(entry.condition)
                .font(.subheadline)
        }
        .padding()
        .background(Color(UIColor.systemBackground))
    }
}

@main
struct WeatherWidget: Widget {
    let kind: String = "WeatherWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WeatherWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Weather Widget")
        .description("Shows current weather conditions.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
} 