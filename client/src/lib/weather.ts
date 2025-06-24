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

// OpenWeatherMap API integration
class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private airPollutionUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
  private oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
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
      // Get current weather and forecast
      const [currentResponse, forecastResponse, airQualityResponse] = await Promise.all([
        fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`),
        fetch(`${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`),
        fetch(`${this.airPollutionUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}`)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok || !airQualityResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      const airQualityData = await airQualityResponse.json();

      return this.formatWeatherData(currentData, forecastData, airQualityData);
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
      // First get coordinates for the city
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`
      );

      if (!geoResponse.ok) {
        throw new Error('Failed to geocode city');
      }

      const geoData = await geoResponse.json();
      if (geoData.length === 0) {
        throw new Error('City not found');
      }

      const { lat, lon } = geoData[0];
      return this.getWeatherByCoords(lat, lon);
    } catch (error) {
      console.error('Weather geocoding error:', error);
      throw error;
    }
  }

  private formatWeatherData(currentData: any, forecastData: any, airQualityData: any): WeatherData {
    const current = currentData;
    const airQuality = airQualityData.list[0];

    return {
      current: {
        temperature: Math.round(current.main.temp),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: current.wind?.speed || 0,
        windDirection: current.wind?.deg || 0,
        uvIndex: 0, // Not available in basic API
        visibility: current.visibility ? current.visibility / 1000 : 0, // Convert to km
        cloudCover: current.clouds.all,
        precipitationProbability: 0, // Not available in current weather
        precipitationType: current.weather[0].main === 'Rain' ? 'rain' : 
                          current.weather[0].main === 'Snow' ? 'snow' : null,
        airQualityIndex: airQuality.main.aqi,
        pollutants: {
          pm25: airQuality.components.pm2_5 || 0,
          pm10: airQuality.components.pm10 || 0,
          o3: airQuality.components.o3 || 0,
          no2: airQuality.components.no2 || 0,
          so2: airQuality.components.so2 || 0,
          co: airQuality.components.co || 0,
        },
        conditions: current.weather[0].description,
        feelsLike: Math.round(current.main.feels_like),
        dewPoint: this.calculateDewPoint(current.main.temp, current.main.humidity),
      },
      forecast: {
        daily: this.extractDailyForecast(forecastData.list),
        hourly: this.extractHourlyForecast(forecastData.list),
      },
      location: {
        latitude: current.coord.lat,
        longitude: current.coord.lon,
        city: current.name,
        region: current.sys.country,
        country: current.sys.country,
      },
      alerts: [], // Would need separate API call for alerts
    };
  }

  private extractDailyForecast(forecastList: any[]): WeatherData['forecast']['daily'] {
    const dailyMap = new Map();

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          high: item.main.temp_max,
          low: item.main.temp_min,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          precipitationChance: (item.pop || 0) * 100,
          conditions: item.weather[0].description,
          uvIndex: 0,
          airQuality: 0,
          temps: [item.main.temp],
        });
      } else {
        const existing = dailyMap.get(date);
        existing.high = Math.max(existing.high, item.main.temp_max);
        existing.low = Math.min(existing.low, item.main.temp_min);
        existing.temps.push(item.main.temp);
      }
    });

    return Array.from(dailyMap.values()).slice(0, 7).map(day => ({
      date: day.date,
      high: Math.round(day.high),
      low: Math.round(day.low),
      humidity: day.humidity,
      pressure: day.pressure,
      precipitationChance: Math.round(day.precipitationChance),
      conditions: day.conditions,
      uvIndex: day.uvIndex,
      airQuality: day.airQuality,
    }));
  }

  private extractHourlyForecast(forecastList: any[]): WeatherData['forecast']['hourly'] {
    return forecastList.slice(0, 24).map(item => ({
      time: new Date(item.dt * 1000).toISOString(),
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      precipitationChance: Math.round((item.pop || 0) * 100),
      conditions: item.weather[0].description,
    }));
  }

  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    return Math.round((b * alpha) / (a - alpha));
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