import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home.jsx'
import CollectionsGallery from "./pages/CollectionsGallery.jsx"

function App () {
  return (
    <div>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections/:slug" element={<CollectionsGallery />} />
      </Routes>
      <Footer></Footer>
    </div>
    )
}

export default App