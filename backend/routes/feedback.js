const router = require("express").Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/", async (req, res) => {
  try {
    const { complaint_id, rating, comments = "" } = req.body;
    if (!complaint_id || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "complaint_id and rating (1-5) are required" });
    }
    const complaint = await db.query("SELECT * FROM complaints WHERE id=$1", [complaint_id]);
    if (!complaint.rows[0]) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Only the complaint creator can leave feedback" });
    }
    if (complaint.rows[0].status !== "Resolved") {
      return res.status(400).json({ message: "Feedback can be submitted after resolution" });
    }
    const result = await db.query(
      `INSERT INTO feedback (complaint_id,user_id,rating,comments)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [complaint_id, req.user.id, Number(rating), comments]
    );
    res.status(201).json({ message: "Feedback submitted", feedback: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Feedback already submitted" });
    console.error(err);
    res.status(500).json({ message: "Could not submit feedback" });
  }
});

module.exports = router;
