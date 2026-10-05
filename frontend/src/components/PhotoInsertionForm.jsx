import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import './PhotoInsertionForm.css'

function PhotoInsertionForm ({ onSuccess, slug }) {
    const [photoFiles, setPhotoFiles] = useState([])
    const [result, setResult] = useState('')
    const authenticate = useAuth()

    async function handleSubmit (e) {
        e.preventDefault()
        try {
            if (authenticate) {
                const formData = new FormData()
                photoFiles.forEach(file => {
                    formData.append('photos', file)
                })
                const upload_response = await fetch(
                    `http://localhost:3000/api/collections/upload`, {
                        method: 'POST',
                        headers: {
                            'authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formData
                    }
                )

                const upload_data = await upload_response.json()

                if (upload_response.ok) {
                    const { photos } = upload_data

                    const db_response = await fetch(
                        `http://localhost:3000/api/collections/insert/${slug}/photos`, {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                                'authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ photos })
                        }
                    )

                    const db_data = await db_response.json()

                    if (db_response.ok) {
                        const { message } = db_data
                        setResult(message)
                        onSuccess()
                    }
                    else {
                        const { error } = db_data
                        setResult(error)
                    }
                }
                else {
                    const { error } = upload_data
                    setResult(error)
                }
            }
            else {
                setResult('Unauthorized')
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    function handleFileChange (e) {
        const fileArray = Array.from(e.target.files)
        setPhotoFiles(fileArray)
    }
    

    return (
        <div className="photo-upload-card">
            <form onSubmit={handleSubmit}>
                <div className="photo-upload-field">
                    <label>Choose the photos you want to insert:</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        required
                    />
                </div>
                <button type="submit">Enter</button>
            </form>
            {result && <p>{result}</p>}
        </div>
    )
}

export default PhotoInsertionForm