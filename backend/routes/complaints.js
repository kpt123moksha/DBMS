const router = require("express").Router();
const db = require("../config/db");
const { authenticate, allowRoles } = require("../middleware/auth");

router.use(authenticate);

router.post("/", async (req, res) => {
  try {
    const { title, description, category, location, priority = "Medium" } = req.body;
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "title, description, category and location are required" });
    }
    const result = await db.query(
      `INSERT INTO complaints (title,description,category,location,priority,created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, category, location, priority, req.user.id]
    );
    res.status(201).json({ message: "Complaint submitted", complaint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create complaint" });
  }
});

router.get("/", async (req, res) => {
  try {
    const isPrivileged = ["admin", "staff"].includes(req.user.role);
    const result = isPrivileged
      ? await db.query(
          `SELECT c.*, u.name AS student_name, s.name AS assigned_staff_name
           FROM complaints c JOIN users u ON u.id=c.created_by
           LEFT JOIN users s ON s.id=c.assigned_to ORDER BY c.created_at DESC`
        )
      : await db.query(
          "SELECT * FROM complaints WHERE created_by=$1 ORDER BY created_at DESC",
          [req.user.id]
        );
    res.json({ complaints: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch complaints" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.name AS student_name, s.name AS assigned_staff_name
       FROM complaints c JOIN users u ON u.id=c.created_by
       LEFT JOIN users s ON s.id=c.assigned_to WHERE c.id=$1`,
      [req.params.id]
    );
    const complaint = result.rows[0];
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (req.user.role === "student" && complaint.created_by !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    const feedback = await db.query("SELECT * FROM feedback WHERE complaint_id=$1", [req.params.id]);
    res.json({ complaint, feedback: feedback.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch complaint" });
  }
});

router.patch("/:id/status", allowRoles("admin", "staff"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const existing = await db.query("SELECT * FROM complaints WHERE id=$1", [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ message: "Complaint not found" });
    if (req.user.role === "staff" && existing.rows[0].assigned_to !== req.user.id) {
      return res.status(403).json({ message: "Staff can update only complaints assigned to them" });
    }
    const result = await db.query(
      "UPDATE complaints SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    res.json({ message: "Status updated", complaint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update status" });
  }
});

module.exports = router;
