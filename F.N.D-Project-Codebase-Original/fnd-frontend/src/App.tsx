import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../src/components/Header/Header";
import FNDHome from "../src/pages/Homepage/FND-Home";
import About from "../src/pages/About/About";
import Contact from "../src/pages/Contact/Contact";
import History from "./pages/History/History";
import Footer from "../src/components/Footer/Footer";

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

        <Footer />
      </div>
    </Router>
  );
}

export default App;
