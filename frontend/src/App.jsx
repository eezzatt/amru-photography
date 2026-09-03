import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home.jsx'
import CollectionsGallery from "./pages/CollectionsGallery.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import "./App.css"

function App () {
  return (
    <div className="app-container">
      <Navbar></Navbar>
      <div className="main-content">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections/:slug" element={<CollectionsGallery />} />
        <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
      <Footer></Footer>
    </div>
    )
}

export default App