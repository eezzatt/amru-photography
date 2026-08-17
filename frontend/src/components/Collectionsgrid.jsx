import { useEffect, useState } from "react";
import './Collectionsgrid.css'

function Collectionsgrid() {
    const [galleries, setGalleries] = useState([])

    useEffect(() => {
        async function loadCollections() {
            try {
                const response = await fetch('http://localhost:3000/api/collections/')
                const data = await response.json()
                const { collections } = data
                setGalleries(collections)
            }
            catch (error) {
                console.log(error)
            }
        }
        loadCollections()
    }, [])

    return (
        <div className="collections_grid">
            {galleries.map((gallery) => (
                <img key={gallery.id} src={gallery.cover_thumbnail_url} alt="collection_thumbnail"></img>
            ))}
        </div>
    )
}

export default Collectionsgrid