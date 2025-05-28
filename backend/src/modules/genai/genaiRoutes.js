// backend/src/modules/genai/genaiRoutes.js
const express = require('express');
const router = express.Router();
const GenAIVideoController = require('./GenAIVideoController');

// Route for generating transcript
// POST /api/genai/generate/transcript
// The .bind(GenAIVideoController) is important if methods in GenAIVideoController use 'this'
// to refer to the instance and its properties/methods, especially if they aren't arrow functions.
router.post('/generate/transcript', (req, res) =>
  GenAIVideoController.generateTranscript(req, res),
);

// Route for segmenting transcript
// POST /api/genai/generate/transcript/segment
router.post('/generate/transcript/segment', (req, res) =>
  GenAIVideoController.generateTranscriptSegment(req, res),
);
module.exports = router;
