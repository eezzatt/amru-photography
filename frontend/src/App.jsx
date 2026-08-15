import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import Description from "./components/Description.jsx"
import Heroslideshow from "./components/Heroslideshow.jsx"
import Collectionsgrid from "./components/Collectionsgrid.jsx"

function App () {
  return (
    <div>
      <Navbar></Navbar>
      <Heroslideshow></Heroslideshow>
      <Description></Description>
      <Collectionsgrid></Collectionsgrid>
      <Footer></Footer>
    </div>
    )
}

export default App