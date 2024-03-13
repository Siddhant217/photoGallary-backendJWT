const { Router } = require("express");
const uploadMiddleware = require("../middlewares/MulterMiddleware");
const UploadModel = require("../models/UploadModel");
const bcrypt = require("bcrypt");
const secretKey = "your_secret_key";
const router = Router();
const jwt = require('jsonwebtoken');
// const config = require('./config'); // Your JWT secret key and other configs
// const session = require('express-session');
//delete photo code:

const fs = require('fs'); // Node.js file system module
const path = require('path');

router.delete('/api/delete/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    // console.log(photoId);  
    const obj = await UploadModel.findById(photoId);  
    if (!obj) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete the photo file from the server's file system
    const filePath = path.join(__dirname, '../public/uploads/', obj.photo);
    console.log(filePath);
    // fs.unlinkSync(filePath); //currrently not deleting from the server storgae due to some bugs
    await UploadModel.deleteOne( {_id: photoId});


    console.log('Photo deleted:', photoId);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/api/get", async (req, res) => {
  const allPhotos = await UploadModel.find().sort({ createdAt: "descending" });
  // const allPhotos = await UploadModel.find({ category: "WildLife" }).sort({ createdAt: "descending" });
  const filteredPhotos = allPhotos.filter(photoObj => photoObj.photo);

  console.log(filteredPhotos);
  console.log("fetchig completed")
  res.send(filteredPhotos);
});


router.get("/api/get/wildLife", async (req, res) => {
  const wildiLifePhotos = await UploadModel.find({ category: "WildLife" }).sort({ createdAt: "descending" });
  console.log("fetching wildLife completed");
  res.send(wildiLifePhotos);
});


router.get("/api/get/nature", async (req, res) => {
  const naturePhotos = await UploadModel.find({ category: "Nature" }).sort({ createdAt: "descending" });
  console.log("fetching nature completed");
  
  res.send(naturePhotos);
});

router.get("/api/get/human", async (req, res) => {
  const humanPhotos = await UploadModel.find({ category: "Human" }).sort({ createdAt: "descending" });
  console.log("fetching human completed");
  res.send(humanPhotos);
});

router.post("/api/save", uploadMiddleware.single("photo"), (req, res) => {
  const { category ,details,tags} = req.body;
  console.log(req.body);
  const photo = req.file.filename;

  console.log(photo);

  UploadModel.create({ photo, category,details,tags })
    .then((data) => {
      console.log("Uploaded Successfully...");
      console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err));
});

router.put('/api/updateLike/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    const obj = await UploadModel.findByIdAndUpdate(
      photoId,
      { $inc: { likeCount: 1 } }, // Increment likeCount by 1
      { new: true } // Return the updated document
    );

    if (!obj) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    console.log('Photo like updated:', photoId);
    // res.send({likeCount});
    res.json({ message: 'Like updated successfully' , likeCount: obj.likeCount});
  } catch (error) {
    console.error('Error updating like of photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/api/getLikeCount/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    const obj = await UploadModel.findById(photoId);

    if (!obj) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.json({ likeCount: obj.likeCount }); // Send the like count as a response
  } catch (error) {
    console.error('Error fetching like count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//http://localhost:5000/api/download/64f6a0afc3f3540068b19e5f
//download button functonality:
router.get('/api/download/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    const obj = await UploadModel.findById(photoId);

    if (!obj) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    console.log(obj.photo)
    res.send(obj.photo);
  } catch (error) {
    console.error('Error sending image count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fetch user details from the database based on the username
    const userDetails = await UploadModel.findOne({ username });

    if (!userDetails) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    console.log('userDetails:', userDetails);
    // Compare the entered password with the hashed password retrieved from the database
    bcrypt.compare(password, userDetails.hased_password_tobeStoredInDb, function(err, result) {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result) {
        // Passwords match: User authenticated successfully
        console.log('Passwords match');

        // Create JWT token
        const token = jwt.sign({ username: userDetails.username }, secretKey);
        return res.json({ token });
      } else {
        // Passwords do not match: Authentication failed
        console.log('Passwords do not match');
        return res.status(401).json({ message: "Invalid username or password" });
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

// Protected route
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const userExists = await UploadModel.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Generate a salt
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, async function (err, salt) {
      if (err) {
        console.error("Error generating salt:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Hash the password using the generated salt
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        try {
          // Create a new user with hashed password and save it to the database
          await UploadModel.create({ username, hased_password_tobeStoredInDb: hash }).then((data) => {
      
            console.log(data);
           
          });
          console.log("User registered successfully");
          return res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
          console.error("Error registering user:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/defaultBackgroundImage", async (req, res) => {
  try {
    // Assuming there's a document with a field named 'backgroundImage' containing the default background image URL
    const defaultBackgroundImageDocument = await UploadModel.findOne({ /* Add query conditions if needed */ });

    if (!defaultBackgroundImageDocument) {
      return res.status(404).json({ message: "Default background image not found" });
    }

    const defaultBackgroundImage = defaultBackgroundImageDocument.backgroundImage;
    res.json({ backgroundImage: defaultBackgroundImage });
  } catch (error) {
    console.error("Error retrieving default background image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
