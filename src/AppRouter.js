import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registro from "./pages/Registro";
import Home from "./pages/Home";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
