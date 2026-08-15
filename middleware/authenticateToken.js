const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
    try {
        const authorization = req.headers['authorization']

        if (!authorization) {
            return res.status(401).json({ error: "Authorization required" })
        }
        
        const token = authorization.split(" ")[1]

        if (!token) {
            return res.status(401).json({ error: "Unauthorized access. No token provided" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()
    }
    catch (err) {
        if (err.name == 'TokenExpiredError') {
            return res.status(401).json({ error: "Token has expired" })
        }
        if (err.name == 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" })
        }
        return res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = authenticateToken