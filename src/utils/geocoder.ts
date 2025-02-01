import { MaplibreGeocoderApiConfig, MaplibreGeocoderFeatureResults } from '@maplibre/maplibre-gl-geocoder';

const constructPlaceName = (properties: any): string => {
  return [
    properties.name,
    properties.street,
    properties.city,
    properties.state,
    properties.country,
  ]
    .filter(Boolean)
    .join(', ');
};

export const forwardGeocode = async (
  config: MaplibreGeocoderApiConfig
): Promise<MaplibreGeocoderFeatureResults> => {
  const { query } = config;

  if (typeof query !== 'string' || query.trim() === '') {
    console.warn('Geocoder query is empty or invalid.');
    return { type: 'FeatureCollection', features: [] };
  }

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      console.error(`Geocoding API returned an error: ${response.statusText}`);
      return { type: 'FeatureCollection', features: [] };
    }

    const geojson = await response.json();

    const features = geojson.features.map((f: any) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: f.geometry.coordinates },
      place_name: constructPlaceName(f.properties),
      properties: f.properties,
      text: f.properties.name,
      place_type: ['place'],
      center: f.geometry.coordinates,
    }));

    return { type: 'FeatureCollection', features };
  } catch (err) {
    console.error('Error fetching geocoding data:', err);
    return { type: 'FeatureCollection', features: [] };
  }
};

export const reverseGeocode = async (): Promise<MaplibreGeocoderFeatureResults> => {
  return { type: 'FeatureCollection', features: [] };
};
