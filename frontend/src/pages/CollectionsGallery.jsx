import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import './CollectionsGallery.css'
import Modal from "../components/Modal"
import PhotoInsertionForm from "../components/PhotoInsertionForm"
import { useAuth } from "../hooks/useAuth"

function CollectionsGallery() {
    const { slug } = useParams()
    const [photoList, setPhotos] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPhotos, setSelectedPhotos] = useState([])
    const [deletionResult, setDeletionResult] = useState('')

    const isLoggedIn = useAuth()

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


    useEffect(() => {
        loadPhotos()
    }, [])


    function toggleSelection(photoID) {
        if (selectedPhotos.includes(photoID)) {
            setSelectedPhotos(selectedPhotos.filter(id => id !== photoID))
        }
        else {
            setSelectedPhotos([...selectedPhotos, photoID])
        }
    }


    function buildClassName(photoID, isLoggedIn) {
        let className = ''
        if (isLoggedIn) {
            className = className + 'selectable'
        }
        if (selectedPhotos.includes(photoID)) {
            className = className + ' ' + 'selected'
        }
        return className
    }


    async function deletePhotos(selected) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/collections/delete/${slug}/photos`, {
                    method: 'DELETE',
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ photo_ids: selected })
                }
            )
            const data = await response.json()

            if (response.ok) {
                setSelectedPhotos([])
                loadPhotos()
                setDeletionResult(data.message)
            }
            else {
                setDeletionResult(data.error)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    
    return (
        <div>
            <h2 className="gallery-name">
                {name}
            </h2>
            <h3 className="gallery-description">
                {description}
            </h3>
            <div className="gallery-grid">
                {photoList.map((photo) => (
                <img
                    key={photo.id} 
                    src={photo.url} 
                    alt='photos' 
                    onClick={isLoggedIn ? () => toggleSelection(photo.id) : null}
                    className={buildClassName(photo.id, isLoggedIn)}
                />
            ))}
                {isLoggedIn && <button onClick={() => setIsModalOpen(true)}>Add photo</button>}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <PhotoInsertionForm slug={slug}></PhotoInsertionForm>
                </Modal>

                {isLoggedIn && selectedPhotos.length > 0 && 
                    <button onClick={() => {deletePhotos(selectedPhotos)}}>Delete photos</button>
                } 
                {deletionResult && <p>{deletionResult}</p>}
            </div>
        </div>
    )
}

export default CollectionsGallery