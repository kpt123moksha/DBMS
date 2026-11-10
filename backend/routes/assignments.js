const router = require("express").Router();
const db = require("../config/db");
const { authenticate, allowRoles } = require("../middleware/auth");

router.use(authenticate, allowRoles("admin"));

router.post("/", async (req, res) => {
  try {
    const { complaint_id, staff_id } = req.body;
    if (!complaint_id || !staff_id) {
      return res.status(400).json({ message: "complaint_id and staff_id are required" });
    }
    const staff = await db.query("SELECT id FROM users WHERE id=$1 AND role='staff'", [staff_id]);
    if (!staff.rows[0]) return res.status(400).json({ message: "staff_id must belong to a staff user" });
    const result = await db.query(
      "UPDATE complaints SET assigned_to=$1,updated_at=NOW() WHERE id=$2 RETURNING *",
      [staff_id, complaint_id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint assigned", complaint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not assign complaint" });
  }
});

module.exports = router;
