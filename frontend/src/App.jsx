import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Station from "./pages/Station";
import Stations from "./pages/Station";   // ✅ ADD THIS
import MapView from "./pages/MapView";
import RoutePlanner from "./pages/RoutePlanner";
import DelayInsights from "./pages/DelayInsights";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ✅ Stations list page */}
        <Route path="/stations" element={<Stations />} />

        {/* Station detail page */}
        <Route path="/station/:stationId" element={<Station />} />

        <Route path="/map" element={<MapView />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/delay-insights" element={<DelayInsights />} />

        {/* keep this LAST */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}