import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../src/components/Header/header";
import FNDHome from "./pages/FND-Home";
import About from "../src/pages/About";
import Contact from "../src/pages/Contact";
import History from "../src/pages/History";

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
