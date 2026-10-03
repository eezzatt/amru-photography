const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const authenticateToken = require('../middleware/authenticateToken')
const upload = require('../config/upload')
const uploadToCloudinary = require('../config/uploadToCloudinary')
const deleteFromCloudinary = require('../config/deleteFromCloudinary')
const deleteManyFromCloudinary = require('../config/deleteManyFromCloudinary')

router.get('/', async (req, res) => {
    try {
        const response = await pool.query(
            'SELECT collections.*, photos.thumbnail_url AS cover_thumbnail_url FROM collections LEFT JOIN photos ON collections.cover_photo_id = photos.id'
        )

        // if (!response.rows[0]) {
        //     return res.status(400).json({ error: "No collection exists"})
        // }

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

        const collection_name = collection_id_response.rows[0].name

        const collection_description = collection_id_response.rows[0].description

        const collection_id = collection_id_response.rows[0].id

        const response = await pool.query(
            'SELECT * FROM photos WHERE collection_id = $1',
            [collection_id]
        )

        return res.json({ 
            name: collection_name,
            description: collection_description,
            photos: response.rows 
        })
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

        return res.json({
            message: "Collection successfully created",
            collection_slug: slug
        })
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

        const collection = await pool.query(
            'SELECT id, cover_photo_id FROM collections WHERE slug = $1',
            [slug]
        )

        if (!collection.rows[0]) {
            return res.status(400).json({ error: "Collection does not exist" })
        }

        client = await pool.connect()

        await client.query('BEGIN')

        let firstPhotoId = null

        for (const photo of photos) {
            if (firstPhotoId === null) {
                const response = await client.query(
                    'INSERT INTO photos (collection_id, public_id, url, thumbnail_url, height, width) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [collection.rows[0].id, photo.public_id, photo.url, photo.thumbnail_url, photo.height, photo.width]
                )
                firstPhotoId = response.rows[0].id
            }
            else {
                await client.query(
                    'INSERT INTO photos (collection_id, public_id, url, thumbnail_url, height, width) VALUES ($1, $2, $3, $4, $5, $6)',
                    [collection.rows[0].id, photo.public_id, photo.url, photo.thumbnail_url, photo.height, photo.width]
                )
            }
        }

        if (collection.rows[0].cover_photo_id === null) {
            await client.query(
                'UPDATE collections SET cover_photo_id = $1 WHERE id = $2',
                [firstPhotoId, collection.rows[0].id]
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
            thumbnail_url: result.secure_url.replace('/upload', '/upload/w_300,h_300,c_fill'),
            width: result.width,
            height: result.height
        }))

        res.status(200).json({ photos: uploadedPhotos })
    } catch (err) {
        console.error('Cloudinary upload error: ', err)
        res.status(500).json({ error: 'Upload failed' })
    }
})


router.delete('/delete/:slug', authenticateToken, async (req, res) => {
    let client
    try {
        const slug = req.params.slug
        const collection_response = await pool.query(
            'SELECT id FROM collections WHERE slug = $1',
            [slug]
        )

        if (!collection_response.rows[0]) {
            return res.status(404).json({ error: "Collection does not exist" })
        }

        const collection_id = collection_response.rows[0].id

        // Get the public IDs BEFORE deleting the rows
        const photos_response = await pool.query(
            'SELECT public_id FROM photos WHERE collection_id = $1',
            [collection_id]
        )
        const public_ids = photos_response.rows.map(row => row.public_id)

        client = await pool.connect()
        await client.query('BEGIN')
        await client.query('DELETE FROM photos WHERE collection_id = $1', [collection_id])
        await client.query('DELETE FROM collections WHERE id = $1', [collection_id])
        await client.query('COMMIT')

        // Only after the DB commit succeeds
        const cloudinary_ok = await deleteManyFromCloudinary(public_ids)

        return res.json({
            message: cloudinary_ok
                ? "Collection deleted"
                : "Collection deleted, but some images could not be removed from Cloudinary"
        })
    }
    catch (err) {
        if (client) await client.query('ROLLBACK')
        return res.status(500).json({ error: "Collection deletion failed" })
    }
    finally {
        if (client) client.release()
    }
})


router.delete('/delete/:slug/photos', authenticateToken, async (req, res) => {
    let client
    try {
        const slug = req.params.slug
        const collection_response = await pool.query(
            'SELECT id, cover_photo_id FROM collections WHERE slug = $1',
            [slug]
        )

        if (!collection_response.rows[0]) {
            return res.status(400).json({ error: "Collection does not exist" })
        }

        const collection_id = collection_response.rows[0].id
        const cover_photo_id = collection_response.rows[0].cover_photo_id

        const { photo_ids } = req.body

        if (!Array.isArray(photo_ids) || photo_ids.length === 0) {
            return res.status(400).json({ error: "Photo IDs required" })
        }

        // Only photos that belong to this collection
        const photos_response = await pool.query(
            'SELECT public_id FROM photos WHERE id = ANY($1::int[]) AND collection_id = $2',
            [photo_ids, collection_id]
        )
        const public_ids = photos_response.rows.map(row => row.public_id)

        client = await pool.connect()
        await client.query('BEGIN')

        await client.query(
            'DELETE FROM photos WHERE id = ANY($1::int[]) AND collection_id = $2',
            [photo_ids, collection_id]
        )

        const cover_check = await client.query(
            'SELECT id FROM photos WHERE id = $1',
            [cover_photo_id]
        )

        if (cover_check.rowCount === 0) {
            const new_cover = await client.query(
                'SELECT id FROM photos WHERE collection_id = $1 ORDER BY id LIMIT 1',
                [collection_id]
            )
            const new_cover_id = new_cover.rows[0] ? new_cover.rows[0].id : null

            await client.query(
                'UPDATE collections SET cover_photo_id = $1 WHERE id = $2',
                [new_cover_id, collection_id]
            )
        }

        await client.query('COMMIT')

        const cloudinary_ok = await deleteManyFromCloudinary(public_ids)

        return res.json({
            message: cloudinary_ok
                ? "Photos deleted successfully"
                : "Photos deleted, but some images could not be removed from Cloudinary"
        })
    }
    catch (err) {
        if (client) await client.query('ROLLBACK')
        return res.status(500).json({ error: "Internal server error" })
    }
    finally {
        if (client) client.release()
    }
})


module.exports = router