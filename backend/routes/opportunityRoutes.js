const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");


// CREATE OPPORTUNITY (NGO only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ngo"),
  createOpportunity
);


// GET ALL OPPORTUNITIES
router.get("/", getAllOpportunities);


// GET SINGLE OPPORTUNITY
router.get("/:id", getOpportunityById);


// UPDATE OPPORTUNITY
router.put("/:id", authMiddleware, updateOpportunity);


// DELETE OPPORTUNITY
router.delete("/:id", authMiddleware, deleteOpportunity);


module.exports = router;