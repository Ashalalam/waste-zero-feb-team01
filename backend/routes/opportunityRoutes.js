const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const opportunityController = require("../controllers/opportunityController");

// DEBUG: Check if everything is loading properly
console.log("createOpportunity:", opportunityController.createOpportunity);
console.log("getAllOpportunities:", opportunityController.getAllOpportunities);
console.log("getOpportunityById:", opportunityController.getOpportunityById);
console.log("updateOpportunity:", opportunityController.updateOpportunity);
console.log("deleteOpportunity:", opportunityController.deleteOpportunity);
console.log("authMiddleware:", authMiddleware);
console.log("roleMiddleware:", roleMiddleware);

// CREATE (NGO only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("NGO"),
  opportunityController.createOpportunity
);

// GET ALL
router.get("/", opportunityController.getAllOpportunities);

// GET SINGLE
router.get("/:id", opportunityController.getOpportunityById);

// UPDATE (Owner only)
router.put("/:id", authMiddleware, opportunityController.updateOpportunity);

// DELETE (Owner only)
router.delete("/:id", authMiddleware, opportunityController.deleteOpportunity);

module.exports = router;