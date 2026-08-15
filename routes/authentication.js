const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const password_hash = await bcrypt.hash(password, 10)

        const response = await pool.query(
            'INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING id',
            [email, password_hash]
        )

        const token = jwt.sign(
            {user_id: response.rows[0].id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )

        return res.json({ token })
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" })
        }

        const response = await pool.query(
            'SELECT * FROM admins WHERE email=$1',
            [email]
        )

        const user = response.rows[0]

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const valid_password = await bcrypt.compare(password, user.password_hash)

        if (!valid_password) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const token = jwt.sign(
            {user_id: user.id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )

        return res.json({ token })
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router