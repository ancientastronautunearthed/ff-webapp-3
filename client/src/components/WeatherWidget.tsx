import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  AlertTriangle,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { weatherService, type WeatherData } from '@/lib/weather';
import { useToast } from '@/hooks/use-toast';

interface WeatherWidgetProps {
  onWeatherUpdate?: (factors: any) => void;
  showSymptomCorrelations?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  onWeatherUpdate, 
  showSymptomCorrelations = false 
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await weatherService.getCurrentLocation();
      const data = await weatherService.getWeatherByCoords(coords.latitude, coords.longitude);
      
      setWeatherData(data);
      setLastUpdated(new Date());

      // Extract symptom-relevant factors
      if (onWeatherUpdate) {
        const factors = weatherService.getSymptomRelevantFactors(data);
        onWeatherUpdate(factors);
      }

      toast({
        title: "Weather Updated",
        description: `Current conditions for ${data.location.city}`,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch weather data';
      setError(errorMessage);
      
      if (errorMessage.includes('API key')) {
        toast({
          title: "Weather Service Setup Required",
          description: "Please configure your WeatherAPI.com key to enable live weather tracking.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Weather Update Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (conditions: string) => {
    const condition = conditions.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="h-5 w-5" />;
    if (condition.includes('cloud')) return <Cloud className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const getAirQualityColor = (aqi: number) => {
    if (aqi <= 1) return 'bg-green-500';
    if (aqi <= 2) return 'bg-yellow-500';
    if (aqi <= 3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Weather unavailable</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWeather} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-600">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, location } = weatherData;
  const symptomFactors = weatherService.getSymptomRelevantFactors(weatherData);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getWeatherIcon(current.conditions)}
            Live Weather
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchWeather} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-3 w-3" />
          {location.city}, {location.region}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Conditions */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{current.temperature}°</div>
            <div className="text-xs text-gray-500">Feels {current.feelsLike}°</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-3 w-3 text-blue-500" />
              <span>{current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wind className="h-3 w-3 text-gray-500" />
              <span>{Math.round(current.windSpeed)} km/h</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-3 w-3 text-orange-500" />
              <span>{current.pressure} hPa</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-3 w-3 text-gray-500" />
              <span>{current.visibility} km</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 capitalize">
          {current.conditions}
        </div>

        {/* Air Quality */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Air Quality</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getAirQualityColor(current.airQualityIndex)}`} />
            <span className="text-sm">{symptomFactors.pollutionLevel}</span>
          </div>
        </div>

        {showSymptomCorrelations && (
          <>
            <Separator />
            
            {/* Symptom Risk Factors */}
            <div>
              <h4 className="font-medium text-sm mb-3">Symptom Risk Factors</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600">Allergen Risk</span>
                  <Badge 
                    className={`ml-2 text-xs ${getRiskBadgeColor(symptomFactors.allergenRisk)}`}
                    variant="secondary"
                  >
                    {symptomFactors.allergenRisk}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-xs text-gray-600">Mold Risk</span>
                  <Badge 
                    className={`ml-2 text-xs ${getRiskBadgeColor(symptomFactors.moldRisk)}`}
                    variant="secondary"
                  >
                    {symptomFactors.moldRisk}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Detailed Factors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pressure:</span>
                  <span>{current.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UV Index:</span>
                  <span>{current.uvIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM2.5:</span>
                  <span>{Math.round(current.pollutants.pm25)} μg/m³</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dew Point:</span>
                  <span>{current.dewPoint}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cloud Cover:</span>
                  <span>{current.cloudCover}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM10:</span>
                  <span>{Math.round(current.pollutants.pm10)} μg/m³</span>
                </div>
              </div>
            </div>
          </>
        )}

        {lastUpdated && (
          <div className="text-xs text-gray-500 text-center pt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};