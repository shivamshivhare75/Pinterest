const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/Pinterest").then(() => {
  console.log("Server is running at PORT : 3000");
})
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,

  },
  profileImage: {
    type: String,
    default: 'default.jpg' // Assuming default image file name
  },
  contact: {
    type: Number,
    required: true
  },
  boards: {
    type: Array,
    default: []
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ],
  liked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }]
})
userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema)