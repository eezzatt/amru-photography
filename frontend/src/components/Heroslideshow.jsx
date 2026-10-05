import { useEffect, useState } from "react";
import './Heroslideshow.css'

function Heroslideshow() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const images = [
        'https://picsum.photos/id/1015/1200/600',
        'https://picsum.photos/id/1016/1200/600',
        'https://picsum.photos/id/1018/1200/600',
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 8000)

        return () => clearInterval(interval)
    }, [])
    
    return (
        <div className="heroslideshow">
            <img src={images[currentIndex]} alt="hero_slideshow"></img>
        </div>
    )
}

export default Heroslideshow