const Opportunity = require("../models/Opportunity");

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
      ngo: req.user._id, // extracted securely from token
    });

    res.status(201).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    res.status(500).json({
      success: false,
      message: error.message,
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
    res.status(500).json({
      success: false,
      message: error.message,
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
    if (opportunity.ngo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this opportunity",
      });
    }

    const { title, description, requiredSkills, duration, location, status } =
      req.body;

    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.requiredSkills =
      requiredSkills || opportunity.requiredSkills;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.status = status || opportunity.status;

    const updatedOpportunity = await opportunity.save();

    res.status(200).json({
      success: true,
      updatedOpportunity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    if (opportunity.ngo.toString() !== req.user._id.toString()) {
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};