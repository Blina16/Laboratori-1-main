const AboutUs = require('../models/AboutUs');

class AboutUsController {
  static async getAboutUs(req, res) {
    try {
      const aboutUs = await AboutUs.get();
      res.status(200).json(aboutUs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch About Us data' });
    }
  }

  static async updateAboutUs(req, res) {
    const { id, description } = req.body;
    try {
      await AboutUs.update(id, description);
      res.status(200).json({ message: 'About Us updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update About Us data' });
    }
  }
}

module.exports = AboutUsController;