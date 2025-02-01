import React, { createContext, useRef, useState, useEffect, useContext } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import SessionPrompt from '@/components/SessionPrompt';

interface LayerVisibility {
  [layerId: string]: boolean;
}

interface MapState {
  style: any | null;
  visibility: LayerVisibility;
  toggleLayerVisibility: (layerId: string) => void;
  updateLayerPaintProperty: (layerId: string, property: string, value: any) => void;
  updateLayerLayoutProperty: (layerId: string, property: string, value: any) => void;
  mapRef: React.MutableRefObject<MapLibreMap | null>;
  resetStyle: () => void;
  loadStyle: (styleData: any) => void;
}

const MapContext = createContext<MapState | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [style, setStyle] = useState<any | null>(null);
  const [visibility, setVisibility] = useState<LayerVisibility>({});
  const [initialized, setInitialized] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadStyleData = (styleData: any, _skipSave = false) => {
    setStyle(styleData);
    const newVisibility: LayerVisibility = styleData.layers.reduce((acc: LayerVisibility, layer: any) => {
      acc[layer.id] = layer.layout?.visibility !== 'none';
      return acc;
    }, {});
    setVisibility(newVisibility);

    const map = mapRef.current;
    if (map) {
      map.once('styledata', () => {
        Object.entries(newVisibility).forEach(([layerId, isVisible]) => {
          try {
            map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
          } catch (error) {
            console.warn(`Failed to set visibility for layer ${layerId}:`, error);
          }
        });
      });
    }
  };

  const resetStyle = (skipSave = false) => {
    fetch('/default-style.json')
      .then((response) => response.json())
      .then(styleData => {
        loadStyleData(styleData, skipSave);
        const map = mapRef.current;
        if (map) {
          map.setStyle(styleData);
        }
        if (!skipSave) {
          localStorage.removeItem('mapStyle');
          setHasChanges(false);
        }
      })
      .catch((err) => console.error('Error resetting style:', err));
  };

  const handleInitialChoice = (useSaved: boolean) => {
    if (useSaved) {
      const savedStyle = localStorage.getItem('mapStyle');
      if (savedStyle) {
        try {
          const parsed = JSON.parse(savedStyle);
          loadStyleData(parsed, true);
        } catch (error) {
          console.error('Error loading saved style:', error);
          resetStyle(true);
        }
      }
    } else {
      resetStyle(true);
    }
    setInitialized(true);
    setHasChanges(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('mapStyle');
    if (!saved) {
      resetStyle(true);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initialized && hasChanges && style) {
      localStorage.setItem('mapStyle', JSON.stringify(style));
    } else if (initialized && !style) {
      localStorage.removeItem('mapStyle');
    }
    setHasChanges(false);
  }, [style, initialized, hasChanges]);

  const loadStyle = (styleData: any) => {
    if (!styleData?.layers || !Array.isArray(styleData.layers)) {
      console.error('Invalid style format');
      return;
    }
    loadStyleData(styleData);
  };

  const updateLayer = (
    layerId: string,
    updater: (layer: any) => void
  ) => {
    setStyle((prevStyle: any) => {
      if (!prevStyle) return prevStyle;
      const newStyle = structuredClone(prevStyle);
      const layer = newStyle.layers.find((l: any) => l.id === layerId);
      if (layer) updater(layer);
      return newStyle;
    });
  };

  const toggleLayerVisibility = (layerId: string) => {
    setVisibility((prev) => {
      const newVisibility = { ...prev, [layerId]: !prev[layerId] };
      updateLayer(layerId, (layer) => {
        layer.layout = layer.layout || {};
        layer.layout.visibility = newVisibility[layerId] ? 'visible' : 'none';
      });
      setHasChanges(true);
      return newVisibility;
    });
  };

  const updateLayerPaintProperty = (layerId: string, property: string, value: any) => {
    updateLayer(layerId, (layer) => {
      layer.paint = layer.paint || {};
      layer.paint[property] = value;
    });
    setHasChanges(true);
  };

  const updateLayerLayoutProperty = (layerId: string, property: string, value: any) => {
    updateLayer(layerId, (layer) => {
      layer.layout = layer.layout || {};
      layer.layout[property] = value;
    });
    setHasChanges(true);
  };

  return (
    <MapContext.Provider
      value={{
        style,
        visibility,
        toggleLayerVisibility,
        updateLayerPaintProperty,
        updateLayerLayoutProperty,
        mapRef,
        resetStyle,
        loadStyle,
      }}
    >
      {!initialized && <SessionPrompt onChoice={handleInitialChoice} />}
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error('useMapContext must be used within MapProvider');
  return context;
};
