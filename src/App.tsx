import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_KEY = "3841143a6e4e4732816225852250908";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function App() {
  const [city, setCity] = useState("");
  const [citiesWeather, setCitiesWeather] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
          city
        )}`
      );
      const data = await res.json();
      console.log("API response:", data);
      if (data.error) {
        throw new Error(
          data.error.message ||
            "City not found. Please check the spelling or try another city."
        );
      }
      setCitiesWeather((prev) => {
        if (
          prev.some(
            (w) =>
              w.location.name === data.location.name &&
              w.location.country === data.location.country
          )
        )
          return prev;
        return [...prev, data];
      });
      setCity("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeWeatherInfo = (name: string, country: string) => {
    setCitiesWeather(prev => prev.filter(w => !(w.location.name === name && w.location.country === country)));
  };
  const mapCenter =
    citiesWeather.length > 0
      ? [citiesWeather[0].location.lat, citiesWeather[0].location.lon]
      : [20, 0];

  return (
    <div className="weather-app">
      <h1>The Weather App</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div
        style={{
          height: "400px",
          width: "100%",
          margin: "24px 0",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={mapCenter as [number, number]}
          zoom={citiesWeather.length > 0 ? 4 : 2}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {citiesWeather.map((cityWeather) => (
            <Marker
              key={cityWeather.location.name + cityWeather.location.country}
              position={
                [cityWeather.location.lat, cityWeather.location.lon] as [
                  number,
                  number
                ]
              }
              icon={defaultIcon as any}
            >
              <Popup>
                <div style={{ textAlign: "center" }}>
                  <strong>
                    {cityWeather.location.name}, {cityWeather.location.country}
                  </strong>
                  <br />
                  <img
                    src={cityWeather.current.condition.icon}
                    alt={cityWeather.current.condition.text}
                    style={{ width: 50 }}
                  />
                  <br />
                  {Math.round(cityWeather.current.temp_c)}°C
                  <br />
                  {cityWeather.current.condition.text}
                  <br />
                  Humidity: {cityWeather.current.humidity}%<br />
                  Wind: {Math.round(cityWeather.current.wind_kph)} kph
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {citiesWeather.length > 0 && (
        <div>
          <h2>Weather Details</h2>
          {citiesWeather.map((weather) => (
            <div
              className="weather-info"
              key={weather.location.name + weather.location.country}
            >
                <button
                  style={{ float: 'right', background: '#ff3333', color: '#fff', border: 'none', borderRadius: '20px', padding: '4px 10px', cursor: 'pointer', marginBottom: '8px' }}
                  onClick={() => removeWeatherInfo(weather.location.name, weather.location.country)}
                  aria-label={`Remove ${weather.location.name}`}
                >
                  Remove
                </button>
              <h2>
                {weather.location.name}, {weather.location.country}
              </h2>
              <div className="temp">{Math.round(weather.current.temp_c)}°C</div>
              <div className="desc">{weather.current.condition.text}</div>
              <img
                src={weather.current.condition.icon}
                alt={weather.current.condition.text}
                className="weather-icon"
              />
              <div className="details">
                <span>Humidity: {weather.current.humidity}%</span>
                <span>Wind: {Math.round(weather.current.wind_kph)} kph</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
