import React, { useEffect, useState, useRef } from 'react';
import { useMapContext } from '@/context/MapContext';
import LayerGroup from './LayerGroup';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExportImageDialog } from './ExportImageDialog';

interface LayerGroupData {
  [group: string]: {
    displayName: string;
    layers: {
      [layerId: string]:
        | string
        | {
            displayName: string;
            children?: { [child: string]: string };
          };
    };
  };
}

const Sidebar: React.FC = () => {
  const { style, resetStyle, loadStyle } = useMapContext();
  const [layerGroups, setLayerGroups] = useState<LayerGroupData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/layer-groups.json')
      .then((response) => response.json())
      .then(setLayerGroups)
      .catch((error) => console.error('Failed to load layer groups', error));
  }, []);

  const handleSave = () => {
    if (!style) return;
    
    const jsonString = JSON.stringify(style, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `map-style-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const styleData = JSON.parse(event.target?.result as string);
        loadStyle(styleData);
      } catch (error) {
        console.error('Error parsing style file:', error);
        alert('Invalid style file format');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetStyle();
    setIsConfirmOpen(false);
  }

  const defaultOpenGroup = layerGroups ? Object.keys(layerGroups)[0] : undefined;

  return (
    <div className={`absolute top-0 left-0 z-10 h-screen w-80 pl-1 pr-2 bg-gray-100 border-e border-blue-200 shadow-[4px_0_8px_rgba(0,0,0,0.15)] transform transition-transform duration-300 ${
      isCollapsed ? '-translate-x-[17rem]' : ''
    }`}>

      <div className="flex flex-col h-full">
        <div className="flex gap-2 py-3 px-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-800 text-primary-foreground shadow hover:bg-blue-800/90"
          >
            Save
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            Load
          </Button>
        </div>

        <div className="flex gap-2 pb-3 px-2 border-b border-blue-200">
          <ExportImageDialog />
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1"
              >
                Reset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Style Reset</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reset all style changes? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleConfirmReset}
                >
                  Reset Styles
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleFileChange}
          />
        </div>
    
        <div className={`
          h-full overflow-y-auto px-2 
          ${isCollapsed ? 'pointer-events-none' : ''}
          scrollbar scrollbar-thumb-gray-300 scrollbar-track-gray-100
          scrollbar-thumb-rounded-full scrollbar-track-rounded-full
          ${isCollapsed ? 'scrollbar-width-none' : ''}
        `}>
            {!layerGroups ? (
              <p>Loading layer groups...</p>
            ) : !style?.layers ? (
              <p>Loading map style...</p>
            ) : (
              <Accordion
                type="single"
                collapsible
                defaultValue={defaultOpenGroup}
              >
                {Object.entries(layerGroups).map(([groupKey, group]) => (
                  <AccordionItem key={groupKey} value={groupKey}>
                    <AccordionTrigger className="text-lg font-bold text-gray-800 py-2">
                      {group.displayName}
                    </AccordionTrigger>
                    <AccordionContent>
                      <LayerGroup group={group} styleLayers={style.layers} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              absolute -right-[calc(1.75rem+2px)] top-1/2 -translate-y-1/2 
              bg-gradient-to-l from-gray-200 via-gray-100 via-5% to-gray-100 rounded-l-none rounded-r-lg p-0
              transition-all z-20
              h-28 w-10 flex items-center justify-center
              shadow-[4px_2px_6px_-2px_rgba(0,0,0,0.1),8px_0_8px_rgba(0,0,0,0.075)]
              hover:shadow-[4px_2px_8px_-2px_rgba(0,0,0,0.15),8px_0_4px_rgba(0,0,0,0.075)]
              group
              backdrop-blur-sm
              border-r border-blue-200 hover:border-blue-300
              active:scale-95
            `}
          >
          {isCollapsed ? (
            <ChevronRight className="h-14 w-14 text-gray-600 group-hover:text-gray-950 transition-all relative z-10" />
          ) : (
            <ChevronLeft className="h-14 w-14 text-gray-600 group-hover:text-gray-950 transition-all relative z-10" />
          )}
        </button>
        <div className='p-3 mb-2 text-sm bg-white border rounded-sm shadow-sm'>
          <p>This web app was originally created to make our <a className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600' href="https://pghshop.com/product/pittsburgh-street-map-art-iconic-design-for-steel-city-fans-matte-canvas-stretched-1-25/">Pittsburgh Street Map Art</a> design. We have it printed on a few products you can purchase at <a className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600' href="https://pghshop.com">PGH Shop</a>!</p>
          <p className='mt-2 ms-1 text-gray-600 text-xs'>Developed by <a className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600' href="https://github.com/dev4pgh">Dev4PGH</a></p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;