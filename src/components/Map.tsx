import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapContext } from '../context/MapContext';
import { forwardGeocode, reverseGeocode } from '../utils/geocoder';

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { style, mapRef } = useMapContext();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: [-79.9959, 40.4406], // Pittsburgh
      zoom: 12,
      style: style || '/default-style.json',
    });

    map.addControl(
      new MaplibreGeocoder(
        { forwardGeocode, reverseGeocode },
        { maplibregl, showResultsWhileTyping: true }
      ),
      'top-right'
    );

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    mapRef.current = map;

    map.once('styledata', () => {
      if (style) {
        style.layers.forEach((layer: any) => {
          if (layer.paint) {
            Object.entries(layer.paint).forEach(([prop, value]) => {
              map.setPaintProperty(layer.id, prop, value);
            });
          }
          if (layer.layout) {
            Object.entries(layer.layout).forEach(([prop, value]) => {
              map.setLayoutProperty(layer.id, prop, value);
            });
          }
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !style) return;

    const handleStyleUpdate = () => {
      map.once('styledata', () => {
        style.layers.forEach((layer: any) => {
          if (layer.paint) {
            Object.entries(layer.paint).forEach(([prop, value]) => {
              map.setPaintProperty(layer.id, prop, value);
            });
          }
          if (layer.layout) {
            Object.entries(layer.layout).forEach(([prop, value]) => {
              map.setLayoutProperty(layer.id, prop, value);
            });
          }
        });
      });
    };

    map.setStyle(style);
    handleStyleUpdate();

  }, [style]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default Map;