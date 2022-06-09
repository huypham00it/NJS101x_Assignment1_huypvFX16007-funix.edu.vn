const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Manager = new Schema({ 
    name: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, required: true},
    image: {type: String, required: true},
})

module.exports = mongoose.model('Manager', Manager);