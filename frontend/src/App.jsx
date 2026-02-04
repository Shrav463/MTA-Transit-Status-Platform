import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Station from "./pages/Station";
import MapView from "./pages/MapView";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/station/:stationId" element={<Station />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
}
