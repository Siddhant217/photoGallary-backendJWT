// const mongoose = require("mongoose");

// const uploadSchema = new mongoose.Schema(
//   {
//     photo: String,
//     category: String,
//     likeCount: {
//       type: Number,
//       default: 0 // Set the initial value to zero
//     },
//     tags: String,
//     username: String,
//     email: String,
//     password: String,
//     details: String,
//   }, 
//   {
//     timestamps: true
//   }
// );

// module.exports = mongoose.model("Upload", uploadSchema);
                
const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    photo: String,
    category: String,
    likeCount: {
      type: Number,
      default: 0 // Set the initial value to zero
    },
    tags: String,
    username: String,
    email: String,
    hased_password_tobeStoredInDb: String,
    details: String,
    backgroundImage: {
        type: String,
        default: "../public/uploads/052c7e93-bad7-4706-9291-3a2b14677ffe_.jpg" // Default background image URL
      }
  }, 
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Upload", uploadSchema);