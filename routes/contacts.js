const express = require('express')
const router = express.Router()
const transporter = require('../middleware/smtp_transporter')
const contacts_limiter = require('../middleware/contacts_limiter')

router.post('/', contacts_limiter, async (req, res) => {
    try {
        const { name, email, message } = req.body

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required"})
        }

        const info = await transporter.sendMail({
            from: `${process.env.SMTP_USER}`,
            to: `${process.env.SMTP_USER}`,
            replyTo: `${name} <${email}>`,
            text: `${message}`
        })

        return res.json({ 
            accepted: info.accepted,
            rejected: info.rejected
        })
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error"})
    }
})

module.exports = router