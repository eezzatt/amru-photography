const {rateLimit, MINUTE} = require('express-rate-limit')

const contacts_limit = rateLimit({
    windowMs: 15 * MINUTE,
    max: 3,
    message: { error: "Try again in 15 minutes" }
})

module.exports = contacts_limit