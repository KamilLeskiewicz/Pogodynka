import Foundation

struct WeatherData: Codable {
    let temperature: String
    let condition: String
    let city: String
    let timestamp: Date
}

class WeatherDataService {
    static let shared = WeatherDataService()
    private let userDefaults = UserDefaults(suiteName: "group.com.yourapp.weather")
    
    private init() {}
    
    func saveWeatherData(_ data: WeatherData) {
        if let encoded = try? JSONEncoder().encode(data) {
            userDefaults?.set(encoded, forKey: "weatherData")
            userDefaults?.synchronize()
        }
    }
    
    func getWeatherData() -> WeatherData? {
        guard let data = userDefaults?.data(forKey: "weatherData"),
              let weatherData = try? JSONDecoder().decode(WeatherData.self, from: data) else {
            return nil
        }
        return weatherData
    }
} 