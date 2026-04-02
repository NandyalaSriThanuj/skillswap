// routes/users.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const {
  getUserProfile, updateProfile, searchUsers,
  addSkillOffer, removeSkillOffer,
  addSkillRequest, removeSkillRequest,
  getAllSkills, getMatches
} = require('../controllers/userController');

// Configure file upload for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name to avoid conflicts
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

router.get('/skills/all', getAllSkills);                        // GET all available skills
router.get('/matches', getMatches);                            // GET skill matches
router.get('/search', searchUsers);                            // GET search users
router.get('/:id', getUserProfile);                            // GET user profile
router.put('/profile', upload.single('photo'), updateProfile); // PUT update profile
router.post('/skills/offer', addSkillOffer);                   // POST add skill offer
router.delete('/skills/offer/:id', removeSkillOffer);          // DELETE remove skill offer
router.post('/skills/want', addSkillRequest);                  // POST add skill want
router.delete('/skills/want/:id', removeSkillRequest);         // DELETE remove skill want

module.exports = router;
