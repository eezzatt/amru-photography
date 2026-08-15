const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const authenticateToken = require('../middleware/authenticateToken')
const upload = require('../config/upload')
const uploadToCloudinary = require('../config/uploadToCloudinary')

router.get('/', async (req, res) => {
    try {
        const response = await pool.query(
            'SELECT * FROM collections'
        )

        if (!response.rows[0]) {
            return res.status(400).json({ error: "No collection exists"})
        }

        return res.json({ collections: response.rows })
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error"})
    }
})


router.get('/:slug/photos', async (req, res) => {
    try {
        const slug = req.params.slug

        const collection_id_response = await pool.query(
            'SELECT * FROM collections WHERE slug = $1',
            [slug]
        )

        if (!collection_id_response.rows[0]) {
            return res.status(400).json({ error: "No such collection exists"})
        }

        const collection_id = collection_id_response.rows[0].id

        const response = await pool.query(
            'SELECT * FROM photos WHERE collection_id = $1',
            [collection_id]
        )

        return res.json({ photos: response.rows })
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { collection_name, description } = req.body

        if (!collection_name) {
            return res.status(400).json({ error: "Collection name required" })
        }

        const slug = collection_name.toLowerCase().split(" ").join("-")
        
        await pool.query(
            'INSERT INTO collections (name, slug, description) VALUES ($1, $2, $3)',
            [collection_name, slug, description]
        )

        return res.json({ message: "Collection successfully created" })
    }
    catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "Collection already exists" })
        }
        else {
            return res.status(500).json({ error: "Internal server error" })
        }
    }
})

router.post('/insert/:slug/photos', authenticateToken, async (req, res) => {
    let client
    try {
        const slug = req.params.slug
        const { photos } = req.body
        
        if (!Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ error: "Photo url required"})
        }

        const collection_id = await pool.query(
            'SELECT id FROM collections WHERE slug = $1',
            [slug]
        )

        if (!collection_id.rows[0]) {
            return res.status(400).json({ error: "Collection does not exist" })
        }

        client = await pool.connect()

        await client.query('BEGIN')

        for (const photo of photos) {
            await client.query(
                'INSERT INTO photos (collection_id, url, thumbnail_url, height, width) VALUES ($1, $2, $3, $4, $5)',
                [collection_id.rows[0].id, photo.url, photo.thumbnail_url, photo.height, photo.width]
            )
        }

        await client.query('COMMIT')
        return res.json({ message: "Photos successfully inserted"})
 
        }
    catch (err) {
        if (client) await client.query('ROLLBACK')
        return res.status(500).json({ error: "Internal server error" })
    }
    finally {
        if (client) client.release()
    }
})


router.post('/upload', authenticateToken, upload.array('photos', 50), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' })
        }
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer))

        const results = await Promise.all(uploadPromises)

        const uploadedPhotos = results.map(result => ({
            url: result.secure_url,
            public_id: result.public_id,
            thumbnail_url: result.secure_url.replace('/upload', '/upload/w_300,h_300,c_fill')
        }))

        res.status(200).json({ photos: uploadedPhotos })
    } catch (err) {
        console.error('Cloudinary upload error: ', err)
        res.status(500).json({ error: 'Upload failed' })
    }
})


module.exports = router