import { useEffect, useState } from "react";
import './Collectionsgrid.css'
import { Link } from "react-router-dom";

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
                <div key={gallery.id}>
                    <Link to={`/collections/${gallery.slug}`}>
                        <img src={gallery.cover_thumbnail_url} alt="collection_thumbnail"></img>
                        <h3>{gallery.name}</h3>
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default Collectionsgrid