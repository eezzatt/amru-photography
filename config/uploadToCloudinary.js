const cloudinary = require('./cloudinary')

function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'amru-photography'
            },
            (error, result) => {
                if (error) {
                    reject (error)
                } else {
                    resolve(result)
                }
            }
        )
        stream.end(buffer)
    })
}

module.exports = uploadToCloudinary