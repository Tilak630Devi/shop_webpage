const express = require('express');
const router = express.Router();

// Example: GET all products
router.get('/', (req, res) => {
  res.json({ ok: true, products: [] });
});

module.exports = router;
