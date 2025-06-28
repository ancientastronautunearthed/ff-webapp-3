interface WeatherData {
    current: {
      temperature: number;
      humidity: number;
      pressure: number;
      windSpeed: number;
      windDirection: number;
      uvIndex: number;
      visibility: number;
      cloudCover: number;
      precipitationProbability: number;
      precipitationType: string | null;
      airQualityIndex: number;
      pollutants: {
        pm25: number;
        pm10: number;
        o3: number;
        no2: number;
        so2: number;
        co: number;
      };
      conditions: string;
      feelsLike: number;
      dewPoint: number;
    };
    forecast: {
      daily: Array<{
        date: string;
        high: number;
        low: number;
        humidity: number;
        pressure: number;
        precipitationChance: number;
        conditions: string;
        uvIndex: number;
        airQuality: number;
      }>;
      hourly: Array<{
        time: string;
        temperature: number;
        humidity: number;
        pressure: number;
        precipitationChance: number;
        conditions: string;
      }>;
    };
    location: {
      latitude: number;
      longitude: number;
      city: string;
      region: string;
      country: string;
    };
    alerts: Array<{
      type: string;
      severity: string;
      description: string;
      startTime: string;
      endTime: string;
    }>;
  }
  
  interface GeolocationCoords {
    latitude: number;
    longitude: number;
  }
  
  // WeatherAPI.com integration
  class WeatherService {
    private apiKey: string;
    private baseUrl = 'https://api.weatherapi.com/v1';
  
    constructor() {
      // Corrected to use the standard VITE_ prefix and the correct variable name
      this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
      if (!this.apiKey) {
          console.error("Configuration error: VITE_WEATHER_API_KEY is not set in the environment.");
      }
    }
  
    async getCurrentLocation(): Promise<GeolocationCoords> {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }
  
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(new Error(`Geolocation error: ${error.message}`));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });
    }
  
    async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
      if (!this.apiKey) {
        throw new Error('Weather API key not configured');
      }
  
      try {
        // Get current weather and forecast with air quality
        const response = await fetch(
          `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=7&aqi=yes&alerts=yes`
        );
  
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
  
        const data = await response.json();
        return this.formatWeatherAPIData(data);
      } catch (error) {
        console.error('Weather API error:', error);
        throw error;
      }
    }
  
    async getWeatherByCity(city: string): Promise<WeatherData> {
      if (!this.apiKey) {
        throw new Error('Weather API key not configured');
      }
  
      try {
        const response = await fetch(
          `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=yes&alerts=yes`
        );
  
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
  
        const data = await response.json();
        return this.formatWeatherAPIData(data);
      } catch (error) {
        console.error('Weather API error:', error);
        throw error;
      }
    }
  
    private formatWeatherAPIData(data: any): WeatherData {
      const current = data.current;
      const location = data.location;
      const forecast = data.forecast;
      
      return {
        current: {
          temperature: Math.round(current.temp_c),
          humidity: current.humidity,
          pressure: current.pressure_mb,
          windSpeed: current.wind_kph,
          windDirection: current.wind_degree,
          uvIndex: current.uv,
          visibility: current.vis_km,
          cloudCover: current.cloud,
          precipitationProbability: current.precip_mm > 0 ? 80 : 20,
          precipitationType: current.precip_mm > 0 ? 
            (current.temp_c < 0 ? 'snow' : 'rain') : null,
          airQualityIndex: current.air_quality?.['us-epa-index'] || 1,
          pollutants: {
            pm25: current.air_quality?.pm2_5 || 0,
            pm10: current.air_quality?.pm10 || 0,
            o3: current.air_quality?.o3 || 0,
            no2: current.air_quality?.no2 || 0,
            so2: current.air_quality?.so2 || 0,
            co: current.air_quality?.co || 0,
          },
          conditions: current.condition.text,
          feelsLike: Math.round(current.feelslike_c),
          dewPoint: Math.round(current.dewpoint_c),
        },
        forecast: {
          daily: forecast.forecastday.map((day: any) => ({
            date: day.date,
            high: Math.round(day.day.maxtemp_c),
            low: Math.round(day.day.mintemp_c),
            humidity: day.day.avghumidity,
            pressure: current.pressure_mb, // Use current pressure as daily average not available
            precipitationChance: Math.round(day.day.daily_chance_of_rain || day.day.daily_chance_of_snow || 0),
            conditions: day.day.condition.text,
            uvIndex: day.day.uv,
            airQuality: current.air_quality?.['us-epa-index'] || 1,
          })),
          hourly: forecast.forecastday[0].hour.slice(0, 24).map((hour: any) => ({
            time: hour.time,
            temperature: Math.round(hour.temp_c),
            humidity: hour.humidity,
            pressure: hour.pressure_mb,
            precipitationChance: Math.round(hour.chance_of_rain || hour.chance_of_snow || 0),
            conditions: hour.condition.text,
          })),
        },
        location: {
          latitude: location.lat,
          longitude: location.lon,
          city: location.name,
          region: location.region,
          country: location.country,
        },
        alerts: data.alerts?.alert?.map((alert: any) => ({
          type: alert.category,
          severity: alert.severity,
          description: alert.desc,
          startTime: alert.effective,
          endTime: alert.expires,
        })) || [],
      };
    }
  
    // Get weather factors that commonly affect Morgellons symptoms
    getSymptomRelevantFactors(weatherData: WeatherData): {
      barometricPressure: number;
      humidity: number;
      temperature: number;
      airQuality: number;
      uvIndex: number;
      windSpeed: number;
      precipitationChance: number;
      allergenRisk: 'low' | 'moderate' | 'high';
      moldRisk: 'low' | 'moderate' | 'high';
      pollutionLevel: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
    } {
      const { current } = weatherData;
  
      // Calculate allergen risk based on conditions
      let allergenRisk: 'low' | 'moderate' | 'high' = 'low';
      if (current.windSpeed > 15 && current.humidity < 40) {
        allergenRisk = 'high';
      } else if (current.windSpeed > 8 || current.humidity < 50) {
        allergenRisk = 'moderate';
      }
  
      // Calculate mold risk
      let moldRisk: 'low' | 'moderate' | 'high' = 'low';
      if (current.humidity > 70 && current.temperature > 20) {
        moldRisk = 'high';
      } else if (current.humidity > 60) {
        moldRisk = 'moderate';
      }
  
      // Air quality interpretation
      let pollutionLevel: 'good' | 'moderate' | 'unhealthy' | 'hazardous' = 'good';
      if (current.airQualityIndex >= 4) {
        pollutionLevel = 'hazardous';
      } else if (current.airQualityIndex >= 3) {
        pollutionLevel = 'unhealthy';
      } else if (current.airQualityIndex >= 2) {
        pollutionLevel = 'moderate';
      }
  
      return {
        barometricPressure: current.pressure,
        humidity: current.humidity,
        temperature: current.temperature,
        airQuality: current.airQualityIndex,
        uvIndex: current.uvIndex,
        windSpeed: current.windSpeed,
        precipitationChance: current.precipitationProbability,
        allergenRisk,
        moldRisk,
        pollutionLevel,
      };
    }
  }
  
  export const weatherService = new WeatherService();
  export type { WeatherData, GeolocationCoords };