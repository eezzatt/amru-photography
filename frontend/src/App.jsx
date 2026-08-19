import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home.jsx'

function App () {
  return (
    <div>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer></Footer>
    </div>
    )
}

export default App