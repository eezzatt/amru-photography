import { useEffect, useState } from "react";
import './Collectionsgrid.css'
import { Link } from "react-router-dom";
import Modal from "./Modal";
import CollectionCreationForm from "./CollectionCreationForm";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Collectionsgrid() {
    const [galleries, setGalleries] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [ deletionResult, setDeletionResult ] = useState('')

    const isLoggedIn = useContext(AuthContext).isLoggedIn

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


    async function deleteCollection(slug) {
        const response = await fetch(`http://localhost:3000/api/collections/delete/${slug}`, {
                method: "DELETE",
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
        const data = await response.json()
        const { message } = data
        if (!response.ok) {
            setDeletionResult(data.error)
        }
        else {
            loadCollections()
            setDeletionResult(message)
        }
    }

    useEffect(() => {
        loadCollections()
    }, [])

    return (
        <div className="collections_grid">
            {galleries.map((gallery) => (
                <div key={gallery.id} className="collection">
                    <Link to={`/collections/${gallery.slug}`}>
                        <img src={gallery.cover_thumbnail_url} alt="collection_thumbnail"></img>
                        <h3>{gallery.name}</h3>
                    </Link>
                    {isLoggedIn && <button onClick={() => deleteCollection(gallery.slug)}>Delete Collection</button>}
                </div>
            ))}
            {isLoggedIn && <button onClick={() => setIsModalOpen(true)}>Add collection</button>}
            {isLoggedIn && deletionResult && <p>{deletionResult}</p>}
            {isModalOpen &&
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <CollectionCreationForm onSuccess={loadCollections}></CollectionCreationForm>
                </Modal>}
        </div>
    )
}

export default Collectionsgrid