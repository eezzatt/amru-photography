import { useEffect, useState } from "react";
import './Collectionsgrid.css'
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Modal from "./Modal";
import CollectionCreationForm from "./CollectionCreationForm";

function Collectionsgrid() {
    const [galleries, setGalleries] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const isLoggedIn = useAuth()

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
            {isLoggedIn && <button onClick={() => setIsModalOpen(true)}>Add collection</button>}
            {isModalOpen &&
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <CollectionCreationForm></CollectionCreationForm>
                </Modal>}
        </div>
    )
}

export default Collectionsgrid