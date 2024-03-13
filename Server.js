const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const UploadRoute = require("./routes/UploadRoute");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//const MONGO_URI="mongodb+srv://siddhantpurohit216:Siddhantokok@photo-gallery.ajyopy9.mongodb.net/"
const MONGO_URI = process.env.MONGO_URI;


// const PORT =5000;
const PORT = process.env.PORT || 5002 ;

try {
  mongoose.connect(MONGO_URI);
  console.log("MonoDB Connected...");
} catch (error) {
  handleError(error);

} 
app.use(UploadRoute);

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
