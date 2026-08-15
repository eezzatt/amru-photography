import { useEffect, useState } from "react";

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
        <div>
            {galleries.map((gallery) => (
                <p key={gallery.id}>{gallery.name}</p>
            ))}
        </div>
    )
}

export default Collectionsgrid