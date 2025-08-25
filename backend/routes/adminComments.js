const express = require('express');
const router = express.Router();

// Example: GET all comments
router.get('/', (req, res) => {
  res.json({ ok: true, comments: [] });
});

module.exports = router;
