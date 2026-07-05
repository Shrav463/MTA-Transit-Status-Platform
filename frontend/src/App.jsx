import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Stations from "./pages/Stations";
import StationDetail from "./pages/StationDetail";
import MapView from "./pages/MapView";
import RoutePlanner from "./pages/RoutePlanner";
import DelayInsights from "./pages/DelayInsights";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/station/:stationId" element={<StationDetail />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/delay-insights" element={<DelayInsights />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
