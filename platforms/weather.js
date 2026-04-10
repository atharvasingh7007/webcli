/**
 * platforms/weather.js
 * Weather — uses open-meteo.com. Completely free, no API key, no rate limits.
 * Also uses nominatim for city → coordinates resolution.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const WEATHER_API = 'https://api.open-meteo.com/v1';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1';

const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Heavy drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

async function resolveCity(city) {
  const url = new URL(`${GEO_API}/search`);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const data = await fetchJSON(url.toString());
  if (!data.results?.length) throw new Error(`City not found: ${city}`);

  const r = data.results[0];
  return {
    name: r.name,
    country: r.country,
    lat: r.latitude,
    lon: r.longitude,
    timezone: r.timezone,
  };
}

export function weatherCommand() {
  const cmd = new Command('weather').description('Weather commands (no auth needed)');

  // current
  cmd
    .command('current <city>')
    .description('Current weather for a city')
    .action(withErrorHandling('weather', async (city) => {
      const loc = await resolveCity(city);

      const url = new URL(`${WEATHER_API}/forecast`);
      url.searchParams.set('latitude', loc.lat);
      url.searchParams.set('longitude', loc.lon);
      url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover,pressure_msl');
      url.searchParams.set('timezone', loc.timezone || 'auto');

      const data = await fetchJSON(url.toString());
      const c = data.current;

      output(envelope('weather', 'current', {
        city: loc.name,
        country: loc.country,
        coordinates: { lat: loc.lat, lon: loc.lon },
        timezone: data.timezone,
        temperature_c: c.temperature_2m,
        feels_like_c: c.apparent_temperature,
        humidity_percent: c.relative_humidity_2m,
        wind_speed_kmh: c.wind_speed_10m,
        wind_direction_deg: c.wind_direction_10m,
        precipitation_mm: c.precipitation,
        cloud_cover_percent: c.cloud_cover,
        pressure_hpa: c.pressure_msl,
        condition: WMO_CODES[c.weather_code] || `Code ${c.weather_code}`,
        time: c.time,
      }));
    }));

  // forecast
  cmd
    .command('forecast <city>')
    .description('7-day weather forecast for a city')
    .option('--days <n>', 'Number of forecast days (1-16)', '7')
    .action(withErrorHandling('weather', async (city, opts) => {
      const loc = await resolveCity(city);

      const url = new URL(`${WEATHER_API}/forecast`);
      url.searchParams.set('latitude', loc.lat);
      url.searchParams.set('longitude', loc.lon);
      url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,sunrise,sunset');
      url.searchParams.set('forecast_days', opts.days);
      url.searchParams.set('timezone', loc.timezone || 'auto');

      const data = await fetchJSON(url.toString());
      const d = data.daily;

      const days = d.time.map((date, i) => ({
        date,
        condition: WMO_CODES[d.weather_code[i]] || `Code ${d.weather_code[i]}`,
        temp_max_c: d.temperature_2m_max[i],
        temp_min_c: d.temperature_2m_min[i],
        precipitation_mm: d.precipitation_sum[i],
        wind_max_kmh: d.wind_speed_10m_max[i],
        sunrise: d.sunrise[i],
        sunset: d.sunset[i],
      }));

      output(envelope('weather', 'forecast', days, {
        city: loc.name,
        country: loc.country,
        days: parseInt(opts.days),
      }));
    }));

  return cmd;
}
