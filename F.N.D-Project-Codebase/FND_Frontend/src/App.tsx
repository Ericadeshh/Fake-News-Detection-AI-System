import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../src/components/header";
import FNDHome from "./pages/FND-Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import History from "./pages/History";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<FNDHome />} />
            <Route path="/home" element={<FNDHome />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
