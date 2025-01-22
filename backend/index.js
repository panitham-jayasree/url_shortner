const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());



const uri = process.env.DATABASE_URL;
console.log("MongoDB URI:", process.env.DATABASE_URL);


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected successfully to MongoDB Atlas"))
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });


const urlSchema = new mongoose.Schema({
  originalurl: String,
  shorturl: String,
  clicks: { type: Number, default: 0 }
});

const Url = mongoose.model('Url', urlSchema);

// POST route to create a shortened URL
app.post('/api/short', async (req, res) => {
  try {
    const { originalurl } = req.body;
    if (!originalurl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    const shorturl = nanoid(8);
    const newUrl = new Url({ originalurl, shorturl });

    await newUrl.save();
    return res.status(200).json({ message: "URL Generated", url: newUrl });
  } catch (error) {
    console.error("Error in POST /api/short:", error); // Log more detailed error
    res.status(500).json({ error: 'Server error' });
  }
});

// GET route to redirect to the original URL based on short URL
app.get('/:shorturl', async (req, res) => {
  try {
    const { shorturl } = req.params;
    const url = await Url.findOne({ shorturl });

    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.originalurl);
    } else {
      return res.status(404).json({ error: 'URL not found' });
    }
  } catch (error) {
    console.error("Error in GET /:shorturl:", error); // Log more detailed error
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
