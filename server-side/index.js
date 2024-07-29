const express = require('express');
const cors = require('cors'); // Import cors
require('dotenv').config();
const mongoose = require('mongoose');
const studyspot = require('./models/studyspot');

const app = express();
const port = process.env.PORT || 3001;

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(express.json());

app.use(cors({
  origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      'studyspotr.vercel.app',
      'studyspotr-harjot-singhs-projects.vercel.app',
      'studyspotr-git-main-harjot-singhs-projects.vercel.app'
  ],
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/createstudyspot', async (req, res) => {
  const { key, name, rating, lat, long, IDRequired, silentArea, openHours, comment } = req.body;

  try {
      let studySpot = await studyspot.findOne({ key });

      if (studySpot) {
          return res.status(200).json({ message: 'Study spot with that name already exists' });
      } else {
          studySpot = new studyspot({
            key,
            name,
            rating,
            location: { lat, long },
            IDRequired,
            silentArea,
            openHours,
            comments: [{ comment: comment, username: 'Username' }]
        });
          await studySpot.save();
          res.status(201).json({ message: 'Study spot created successfully', data: studySpot });
      }
  } catch (error) {
      res.status(400).json({ message: 'Error creating study spot', error: error.message });
  }
});

app.get('/locations', async (req, res) => {
  try {
    // Fetch all study spots
    const locations = await studyspot.find({});
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});