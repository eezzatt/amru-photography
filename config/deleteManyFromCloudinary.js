const deleteFromCloudinary = require('./deleteFromCloudinary')

async function deleteManyFromCloudinary(public_ids) {
    const results = await Promise.all(public_ids.map(id => deleteFromCloudinary(id)))
    return results.every(r => r.result === 'ok' || r.result === 'not found')
}

module.exports = deleteManyFromCloudinary