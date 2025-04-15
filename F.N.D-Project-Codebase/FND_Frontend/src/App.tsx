import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import NewsChecker from "./components/NewsChecker/NewsChecker";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import History from "./pages/History";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<NewsChecker />} />
            <Route path="/home" element={<Home />} />
            <Route path="/verify" element={<NewsChecker />} />
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
