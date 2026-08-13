const { parseMarksheet } = require('../services/marksheetParser');

async function uploadMarksheet(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const courses = await parseMarksheet(req.file.buffer, req.file.mimetype);

    if (courses.length === 0) {
      return res.json({
        courses: [],
        message: 'No courses could be detected in this marksheet. Try a clearer file or add courses manually.',
      });
    }

    res.json({ courses });
  } catch (err) {
    console.error('Marksheet upload error:', err.message);
    res.status(400).json({ error: err.message || 'Could not process this marksheet.' });
  }
}

module.exports = { uploadMarksheet };