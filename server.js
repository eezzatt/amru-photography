require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const collections = require('./routes/collections')
const contacts = require('./routes/contacts')
const authentication = require('./routes/authentication')

app.use(cors())
app.use(express.json())
app.use('/api/collections', collections)
app.use('/api/contacts', contacts)
app.use('/api/authenticate', authentication)

app.get('/', (req, res) => {
    return res.send("Amru's Photography Website")
})


app.listen(3000, (req, res) => {
    console.log("Server running on http://localhost:3000")
})

