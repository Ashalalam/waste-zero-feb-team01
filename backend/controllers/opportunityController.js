const Opportunity = require("../models/opportunity");

// ==============================
// CREATE OPPORTUNITY (NGO only)
// ==============================
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, requiredSkills, duration, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills,
      duration,
      location,
      ngo: req.user.id || req.user._id, // supports demo + DB mode
    });

    res.status(201).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error("Create Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==============================
// GET ALL OPPORTUNITIES
// ==============================
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("ngo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error("Get All Opportunities Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==============================
// GET SINGLE OPPORTUNITY
// ==============================
exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      "ngo",
      "name email"
    );

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error("Get Opportunity By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==============================
// UPDATE OPPORTUNITY (Owner only)
// ==============================
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Ownership check
    if (opportunity.ngo.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this opportunity",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "requiredSkills",
      "duration",
      "location",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        opportunity[field] = req.body[field];
      }
    });

    const updatedOpportunity = await opportunity.save();

    res.status(200).json({
      success: true,
      updatedOpportunity,
    });
  } catch (error) {
    console.error("Update Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==============================
// DELETE OPPORTUNITY (Owner only)
// ==============================
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Ownership check
    if (opportunity.ngo.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this opportunity",
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Delete Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};