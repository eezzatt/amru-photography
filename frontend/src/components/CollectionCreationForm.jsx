import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import "./CollectionCreationForm.css"

function CollectionCreationForm () {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [result, setResult] = useState('')
    const [photoFile, setPhotoFile] = useState(null)
    const authenticate = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if(authenticate) {

                const collection_response = await fetch ('http://localhost:3000/api/collections/create', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            'collection_name': `${name}`,
                            'description': `${description}`
                        })
                    }
                )

                const collection_data = await collection_response.json()

                if (collection_response.ok) {
                    const formData = new FormData()
                    formData.append('photos', photoFile)

                    const photo_upload_response = await fetch(
                        'http://localhost:3000/api/collections/upload', {
                            method: 'POST',
                            headers: {
                                'authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: formData
                        }
                    )

                    const photo_upload_data = await photo_upload_response.json()

                    if (photo_upload_response.ok) {
                        const slug = collection_data.collection_slug
                        const { photos } = photo_upload_data
                        console.log('slug:', slug)
                        console.log('photos:', photos)
                        console.log('photos[0]:', photos[0])

                        const photo_db_response = await fetch(
                            `http://localhost:3000/api/collections/insert/${slug}/photos`, {
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json',
                                    'authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify(
                                    {photos: [{
                                        url: photos[0].url,
                                        thumbnail_url: photos[0].thumbnail_url,
                                        width: photos[0].width,
                                        height: photos[0].height,
                                        public_id: photos[0].public_id
                                    }]}
                                )
                            }
                        )

                        if (photo_db_response.ok) {
                            const message  = collection_data.message
                            setResult(message)
                        }
                    }
                    else {
                        const { error } = photo_upload_data
                        setResult(error)
                    }
                }
                else {
                    const { error } = collection_data
                    setResult(error)
                }
            }
            else {
                setResult("Unauthorized")
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="collection-creation-card">
            <form onSubmit={handleSubmit} className="collection-creation-form">
                <div className="collection-name">
                    <label>Collection Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="collection-desc">
                    <label>Collection Description:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="file"
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit">Enter</button>
                {result && <p>{result}</p>}
            </form>
        </div>
    )
}

export default CollectionCreationForm