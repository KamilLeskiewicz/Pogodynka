#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WeatherWidgetModule, NSObject)

RCT_EXTERN_METHOD(updateWidget:(NSString *)temperature
                  condition:(NSString *)condition
                  city:(NSString *)city
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end 