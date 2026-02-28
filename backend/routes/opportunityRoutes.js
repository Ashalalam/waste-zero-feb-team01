const express = require("express");
const router = express.Router();

const {
  createOpportunity,
  getMyOpportunities,
  getAllOpportunities,
  getAllOpportunitiesForNgo,
  updateOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getMyApplications,
} = require("../controllers/opportunityController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, createOpportunity);
router.get("/", authMiddleware, getMyOpportunities);
router.get("/all", getAllOpportunities);
// NGO can get all opportunities (both NGO and volunteer created)
router.get("/ngo/all", authMiddleware, roleMiddleware("ngo"), getAllOpportunitiesForNgo);
router.get("/my-applications", authMiddleware, getMyApplications);
router.put("/:id", authMiddleware, updateOpportunity);
router.delete("/:id", authMiddleware, deleteOpportunity);
router.post("/:id/apply", authMiddleware, applyToOpportunity);

module.exports = router;
