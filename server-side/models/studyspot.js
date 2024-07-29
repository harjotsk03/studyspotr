const mongoose = require('mongoose');

const studyspotSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    IDRequired: { type: Boolean, required: true },
    silentArea: { type: Boolean, required: true },
    location: {
        lat: { type: Number, required: true },
        long: { type: Number, required: true }
    },
    openHours: { type: String, required: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 1 }, // Changed default to 1
    comments: [{
        comment: { type: String, required: true },
        username: { type: String, required: true }
    }]
});

const studyspot = mongoose.model('studyspot', studyspotSchema);

module.exports = studyspot;
