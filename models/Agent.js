const mongoose = require('mongoose');
require('../models/Post');

const AgentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    tel: {
        type: String,
        required: false
    },
    photo: {
        type: String,
        required: false
    },
    cac: {
        type: String,
        required: false
    },
    id: {
        type: String,
        required: false
    },
    post_id: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref :"Post"
    }]
})

const Agent = mongoose.model("Agent", AgentSchema);

module.exports = Agent;
