const mongoose = require("mongoose");

const wordsSchema = new mongoose.Schema ({
    userID: String,
    username: String,
    wordCount: {
      type: Map, 
      of: Number
    }
})

module.exports = mongoose.model("Words", wordsSchema);