const cloudinary = require('./cloudinary')

function deleteFromCloudinary (public_id) {
    return cloudinary.uploader.destroy(public_id)
}

module.exports = deleteFromCloudinary