import React from 'react';
import LayerRow from './LayerRow';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useMapContext } from '@/context/MapContext';

interface LayerGroupData {
  displayName: string;
  layers: {
    [layerId: string]:
      | string
      | {
          displayName: string;
          children?: { [childId: string]: string };
        };
  };
}

interface LayerGroupProps {
  group: LayerGroupData;
  styleLayers: Array<any>;
}

function getLayerDisplayName(
  layerData: string | { displayName: string; children?: Record<string, string> }
): string {
  return typeof layerData === 'string' ? layerData : layerData.displayName;
}

function getLayerChildren(
  layerData: string | { displayName: string; children?: Record<string, string> }
): Record<string, string> | undefined {
  return typeof layerData === 'object' ? layerData.children : undefined;
}

function getStyleLayerType(styleLayers: any[], layerId: string): string | undefined {
  return styleLayers.find((l) => l.id === layerId)?.type;
}

function getFirstKey(obj: Record<string, any>): string | undefined {
  const keys = Object.keys(obj);
  return keys.length ? keys[0] : undefined;
}

const LayerGroup: React.FC<LayerGroupProps> = ({ group, styleLayers }) => {
  const { visibility, toggleLayerVisibility } = useMapContext();

  const firstLayerId = getFirstKey(group.layers);

  return (
    <Accordion type="single" collapsible defaultValue={firstLayerId} className="space-y-2">
      {Object.entries(group.layers).map(([layerId, layerData]) => {
        const displayName = getLayerDisplayName(layerData);
        const children = getLayerChildren(layerData);
        const layerType = getStyleLayerType(styleLayers, layerId);

        const firstChildId = children ? getFirstKey(children) : undefined;

        return (
          <AccordionItem key={layerId} value={layerId} className='bg-white px-4 border rounded-sm'>
            <AccordionTrigger className="py-3 flex items-center justify-between w-full text-base font-bold text-gray-700 border-b">
              <div className='space-x-2'>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={visibility[layerId] ?? false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleLayerVisibility(layerId)}
                />
                <span>{displayName}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <LayerRow layerId={layerId} layerType={layerType} />

              {children && (
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={firstChildId}
                  className="pl-4 mt-2"
                >
                  {Object.entries(children).map(([childId, childDisplay]) => {
                    const childLayerType = getStyleLayerType(styleLayers, childId);

                    return (
                      <AccordionItem className='bg-gray-50 mt-4 px-3 border rounded-sm' key={childId} value={childId}>
                        <AccordionTrigger className="flex items-center justify-between w-full text-md font-semibold text-gray-700">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={visibility[childId] ?? false}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleLayerVisibility(childId)}
                            />
                            <span>{childDisplay}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <LayerRow layerId={childId} layerType={childLayerType} />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default LayerGroup;
