const express = require("express");
const router = express.Router();

// POST /api/v1/ai-chat/message
// Accepts: { text: string, image?: string (base64) }
// Returns: { text: string }
router.post("/message", async (req, res) => {
  const { text, image } = req.body;

  // Simulate AI response logic
  let aiResponse = "I'm sorry, I couldn't process that request.";
  if (text && typeof text === "string") {
    if (
      text.toLowerCase().includes("hello") ||
      text.toLowerCase().includes("hi")
    ) {
      aiResponse =
        "Hello! How can I assist you with your health queries today?";
    } else if (text.toLowerCase().includes("symptoms")) {
      aiResponse =
        "Please describe your symptoms in more detail. I can provide general information, but for a diagnosis, consult a medical professional.";
    } else if (image) {
      aiResponse =
        "Thank you for the image! I'll analyze it and get back to you soon. (Image processing is simulated)";
    } else if (text.toLowerCase().includes("blockchain")) {
      aiResponse =
        "MedBlock uses blockchain technology to ensure secure and transparent management of medical records. This enhances data integrity and patient privacy.";
    } else if (text.toLowerCase().includes("appointment")) {
      aiResponse =
        "You can schedule an appointment through the 'My Appointments' section of your dashboard. Would you like me to guide you there?";
    } else if (text.toLowerCase().includes("insurance")) {
      aiResponse =
        "For insurance queries, please visit the 'Health Insurance Marketplace' or 'My Insurance' sections. You can also chat with an insurance representative there.";
    } else {
      aiResponse =
        "I'm still learning! Could you please rephrase your question or ask something else?";
    }
  }

  // Simulate delay
  setTimeout(
    () => {
      res.json({ success: true, data: { text: aiResponse } });
    },
    Math.random() * 1000 + 500,
  );
});

module.exports = router;
