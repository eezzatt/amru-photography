import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import './CollectionsGallery.css'

function CollectionsGallery() {
    const { slug } = useParams()
    const [photoList, setPhotos] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        async function loadPhotos() {
            try {
                const response = await fetch(`http://localhost:3000/api/collections/${slug}/photos`)
                const data = await response.json()
                const { name, description, photos } = data
                setPhotos(photos)
                setName(name)
                setDescription(description)
            }
            catch (error) {
                console.log(error)
            }
        }
        loadPhotos()
    }, [slug])
    
    return (
        <div>
            <h2>
                {name}
            </h2>
            <h3>
                {description}
            </h3>
            <div className="gallery-grid">
                {photoList.map((photo) => (
                <img key={photo.id} src={photo.url} alt='photos'></img>
            ))}
            </div>
        </div>
    )
}

export default CollectionsGallery