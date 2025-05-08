import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/UserAuthentication/context/AuthContext";
import ProtectedRoute from "./pages/UserAuthentication/ProtectedRoute/ProtectedRoute";
import Header from "./components/Header/Header";
import FNDHome from "./pages/Homepage/FND-Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import History from "./pages/History/History";
import Login from "./pages/UserAuthentication/Login/Login";
import Signup from "./pages/UserAuthentication/Signup/Signup";
import AdminDashboard from "./pages/UserAuthentication/Admin/AdminDashboard";
import UserDashboard from "./pages/UserAuthentication/User/UserDashboard";
import Footer from "./components/Footer/Footer";
import "./App.css";

function App() {
  return (
    <AuthProvider>
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
