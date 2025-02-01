import React from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import { MapProvider } from './context/MapContext';

const App: React.FC = () => {
  return (
    <MapProvider>
      <div className="relative h-screen w-screen">
        <Sidebar />
        <Map />
      </div>
    </MapProvider>
  );
};

export default App;
