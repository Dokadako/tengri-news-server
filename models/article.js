const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: false,
    },
    mediaUrl: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: true,
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Article', articleSchema);
