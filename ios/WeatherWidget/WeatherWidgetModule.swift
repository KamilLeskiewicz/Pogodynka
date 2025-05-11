import Foundation
import WidgetKit

@objc(WeatherWidgetModule)
class WeatherWidgetModule: NSObject {
    
    @objc
    func updateWidget(_ temperature: String, condition: String, city: String, 
                     resolver resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            let weatherData = WeatherData(
                temperature: temperature,
                condition: condition,
                city: city,
                timestamp: Date()
            )
            WeatherDataService.shared.saveWeatherData(weatherData)
            WidgetCenter.shared.reloadAllTimelines()
            resolve(true)
        } catch {
            reject("ERROR", "Failed to update widget", error)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
} 