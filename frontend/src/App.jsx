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