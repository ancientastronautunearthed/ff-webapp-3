const API_KEY = import.meta.env.NEXT_PUBLIC_VITE_WEATHER_API_KEY;
const API_URL = "https://api.weatherapi.com/v1";

if (!API_KEY) {
  throw new Error("VITE_WEATHER_API_KEY is not set");
}

export const getWeatherData = async (city: string) => {
  try {
    const response = await fetch(
      `${API_URL}/current.json?key=${API_KEY}&q=${city}`
    );
    if (!response.ok) {
      throw new Error("Weather data not found");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};