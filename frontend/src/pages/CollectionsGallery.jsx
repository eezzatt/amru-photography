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

    async function deletePhotos(selectedPhotos) {
        let publicIDs = []
        for (const photoID of selectedPhotos) {
            const publicID = photoList.find(el => el.id === photoID).public_id
            publicIDs.push(publicID)
        }

        const dbDeletionResponse = await fetch(
            `http://localhost:3000/api/collections/delete/${slug}/photos`, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    photo_ids: selectedPhotos
                })
            }
        )

        const cloudDeletionResponse = await fetch(
            `http://localhost:3000/api/collections/delete/${slug}/photos/cloudinary`, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    public_ids: publicIDs
                })
            }
        )

        const dbDeletionData = await dbDeletionResponse.json()
        setDeletionResult(dbDeletionData.message)
    }

    
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