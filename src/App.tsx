import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import PlanDetail from "@/pages/PlanDetail";
import AddPlan from "@/pages/AddPlan";
import Analytics from "@/pages/Analytics";
import Achievements from "@/pages/Achievements";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
        <Route path="/add" element={<AddPlan />} />
        <Route path="/edit/:id" element={<AddPlan />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
    </Router>
  );
}
