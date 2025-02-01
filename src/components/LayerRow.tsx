import React, { useEffect, useState } from 'react';
import { useMapContext } from '../context/MapContext';
import { rgbaToHex, hexToRgba } from '../utils/colorUtils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LayerRowProps {
  layerId: string;
  layerType?: string;
}

interface LayerProperties {
  color: string;
  thickness?: number;
  textSize?: number;
  font?: string | null;
  textHaloColor?: string;
  textHaloWidth?: number;
  textHaloBlur?: number;
  haloWidthPercent?: number;
}

const LayerRow: React.FC<LayerRowProps> = ({ layerId, layerType }) => {
  const { style, updateLayerPaintProperty, updateLayerLayoutProperty } = useMapContext();
  const [layerProperties, setLayerProperties] = useState<LayerProperties>({
    color: '#000000',
  });

  const propertyMappings: Record<string, { paint: string; layout?: string }> = {
    line: { paint: 'line-color', layout: undefined },
    fill: { paint: 'fill-color', layout: undefined },
    symbol: { paint: 'text-color', layout: 'text-size' },
    background: { paint: 'background-color', layout: undefined },
  };

  useEffect(() => {
    if (!style || !layerType) return;
    const styleLayer = style.layers.find((l: any) => l.id === layerId);
    if (!styleLayer) return;

    const paintProp = propertyMappings[layerType]?.paint;
    const layoutProp = propertyMappings[layerType]?.layout;

    const textSize = layerType === 'symbol' && layoutProp
      ? styleLayer.layout?.[layoutProp] || 12
      : undefined;
    
    const actualHaloWidth =
      layerType === 'symbol'
        ? styleLayer.paint?.['text-halo-width'] ?? 0
        : undefined;
    
    let haloWidthPercent = 0;
    if (textSize && actualHaloWidth !== undefined) {
      haloWidthPercent = (actualHaloWidth / (textSize / 4)) * 100;
      haloWidthPercent = Math.max(0, Math.min(haloWidthPercent, 100));
    }

    setLayerProperties({
      color: rgbaToHex(styleLayer.paint?.[paintProp] || '#000000'),
      thickness:
        layerType === 'line'
          ? styleLayer.paint?.['line-width'] ?? 1
          : undefined,
      textSize,
      font:
        layerType === 'symbol'
          ? styleLayer.layout?.['text-font']?.[0] || null
          : undefined,
      textHaloColor:
        layerType === 'symbol'
          ? rgbaToHex(styleLayer.paint?.['text-halo-color'] ?? '#ffffff')
          : undefined,
      textHaloWidth: actualHaloWidth,
      textHaloBlur:
        layerType === 'symbol'
          ? styleLayer.paint?.['text-halo-blur'] ?? 1
          : undefined,
      haloWidthPercent,
    });
  }, [style, layerId, layerType]);

  const handlePropertyChange = (property: keyof LayerProperties, value: any) => {
    setLayerProperties((prev) => ({ ...prev, [property]: value }));
    switch (property) {
      case 'color': {
        const rgbaColor = hexToRgba(value);
        const paintProp = propertyMappings[layerType!]?.paint;
        updateLayerPaintProperty(layerId, paintProp, rgbaColor);
        break;
      }
      case 'thickness': {
        updateLayerPaintProperty(layerId, 'line-width', value);
        break;
      }
      case 'textSize': {
        const { haloWidthPercent = 0 } = layerProperties;
        const safePct = Math.max(0, Math.min(haloWidthPercent, 100));
        const numericHaloWidth = (safePct / 100) * (value / 4);

        setLayerProperties((prev) => ({
          ...prev,
          textSize: value,
          textHaloWidth: numericHaloWidth,
        }));

        updateLayerLayoutProperty(layerId, 'text-size', value);
        updateLayerPaintProperty(layerId, 'text-halo-width', numericHaloWidth);
        break;
      }
      case 'font': {
        updateLayerLayoutProperty(layerId, 'text-font', [value]);
        break;
      }
      case 'textHaloColor': {
        const rgbaColor = hexToRgba(value);
        updateLayerPaintProperty(layerId, 'text-halo-color', rgbaColor);
        break;
      }
      case 'textHaloWidth': {
        updateLayerPaintProperty(layerId, 'text-halo-width', value);
        break;
      }
      case 'textHaloBlur': {
        updateLayerPaintProperty(layerId, 'text-halo-blur', value);
        break;
      }
    }
  };

  const handleHaloWidthPercentChange = (pct: number) => {
    const safePct = Math.max(0, Math.min(pct, 100));
    setLayerProperties((prev) => ({
      ...prev,
      haloWidthPercent: safePct,
    }));

    const { textSize = 12 } = layerProperties;
    const numericHaloWidth = (safePct / 100) * (textSize / 4);

    setLayerProperties((prev) => ({
      ...prev,
      textHaloWidth: numericHaloWidth,
    }));
    updateLayerPaintProperty(layerId, 'text-halo-width', numericHaloWidth);
  };

  return (
    <div className="mt-2 space-y-2 pl-4">
      {['line', 'fill', 'symbol', 'background'].includes(layerType || '') && (
        <div className='flex justify-between items-center'>
          <Label className="text-xs font-medium block">Color:</Label>
          <input
            type="color"
            value={layerProperties.color}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="h-8 w-16 rounded-md border"
          />
        </div>
      )}

      {layerType === 'line' && (
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Thickness:</Label>
            <input
              type="number"
              className="w-16 border rounded p-1 text-xs"
              value={layerProperties.thickness || 1}
              min={0.5}
              max={10}
              step={0.1}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 1;
                handlePropertyChange('thickness', val);
              }}
            />
          </div>
          <Slider
            min={0.5}
            max={10}
            step={0.1}
            value={[layerProperties.thickness || 1]}
            onValueChange={(value) => handlePropertyChange('thickness', value[0])}
            className="mt-1"
          />
        </div>
      )}

      {layerType === 'symbol' && (
        <div className="mt-2 space-y-2">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Text Size:</Label>
              <input
                type="number"
                className="w-16 border rounded p-1 text-xs"
                value={layerProperties.textSize || 12}
                min={8}
                max={100}
                step={0.1}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 12;
                  handlePropertyChange('textSize', val);
                }}
              />
            </div>
            <Slider
              min={8}
              max={48}
              step={0.1}
              value={[layerProperties.textSize || 12]}
              onValueChange={(value) => handlePropertyChange('textSize', value[0])}
              className="mt-1"
            />
          </div>
          {layerProperties.font && (
            <div className="flex justify-between items-center pt-2">
              <Label className="text-xs font-medium block me-2">Font:</Label>
              <Select
                value={layerProperties.font || ''}
                onValueChange={(value) => handlePropertyChange('font', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open Sans Regular">Open Sans Regular</SelectItem>
                  <SelectItem value="Open Sans Bold">Open Sans Bold</SelectItem>
                  <SelectItem value="Open Sans Italic">Open Sans Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium block">Halo Color:</Label>
            <input
              type="color"
              value={layerProperties.textHaloColor || '#ffffff'}
              onChange={(e) => handlePropertyChange('textHaloColor', e.target.value)}
              className="h-8 w-16 rounded-md border"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Halo Width (%):</Label>
              <input
                type="number"
                className="w-16 border rounded p-1 text-xs"
                value={layerProperties.haloWidthPercent?.toFixed(1) ?? 0}
                min={0}
                max={100}
                step={0.5}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  handlePropertyChange('textHaloWidth', val);
                }}
              />
            </div>
            <Slider
              min={0}
              max={100}
              step={0.5}
              value={[layerProperties.haloWidthPercent ?? 0]}
              onValueChange={(value) => handleHaloWidthPercentChange(value[0])}
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Halo Blur:</Label>
              <input
                type="number"
                className="w-16 border rounded p-1 text-xs"
                value={layerProperties.textHaloBlur ?? 1}
                min={0}
                max={10}
                step={0.5}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  handlePropertyChange('textHaloBlur', val);
                }}
              />
            </div>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={[layerProperties.textHaloBlur || 1]}
              onValueChange={(value) => handlePropertyChange('textHaloBlur', value[0])}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerRow;
