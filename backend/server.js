require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Copy .env.example to .env and configure it.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "CampusCare API is running" }));
app.get("/api/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected", detail: err.message });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/feedback", require("./routes/feedback"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`CampusCare API listening on http://localhost:${port}`));
