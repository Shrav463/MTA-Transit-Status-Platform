<<<<<<< HEAD
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
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import RoutePlanner from "./pages/RoutePlanner";
import StationPage from "./pages/StationPage";
import Stations from "./pages/Station";
import DelayInsights from "./pages/DelayInsights";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/station/:id" element={<StationPage />} />
        <Route path="/stations" element={<Stations />}/>
        <Route path="/delay-insights" element={<DelayInsights />} />
      </Routes>
    </Router>
  );
}

export default App;
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
