import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function CollectionsGallery() {
    const { slug } = useParams()
    const [photoList, setPhotos] = useState([])

    useEffect(() => {
        async function loadPhotos() {
            try {
                const response = await fetch(`http://localhost:3000/api/collections/${slug}/photos`)
                const data = await response.json()
                const { photos } = data
                setPhotos(photos)
            }
            catch (error) {
                console.log(error)
            }
        }
        loadPhotos()
    }, [slug])
    
    return (
        <div>
            {photoList.map((photo) => (
                <img key={photo.id} src={photo.url} alt='photos'></img>
            ))}
        </div>
    )
}

export default CollectionsGallery