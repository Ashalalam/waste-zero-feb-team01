const Opportunity = require("../models/Opportunity");

// Create a new opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, requiredSkills, duration, location, status } = req.body;

    // Required field validation
    if (!title || !description || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, duration, and location are required",
      });
    }

    // Determine creator type based on user role
    const createdByType = req.user.role === "ngo" ? "ngo" : "volunteer";

    // Create opportunity
    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration,
      location,
      status: status || "open",
      createdBy: req.user._id,
      createdByType: createdByType,
      ngo: req.user._id, // Keep for backward compatibility
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
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

// Get opportunities for logged in user (NGO or volunteer - gets their own created opportunities)
exports.getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ createdBy: req.user._id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error("Get Opportunities Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all opportunities for NGO (both NGO and volunteer created) - NGO has full access
exports.getAllOpportunitiesForNgo = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("createdBy", "name email role")
      .populate("ngo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error("Get All Opportunities for NGO Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all opportunities (for all users - public listing)
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ status: "open" })
      .populate("createdBy", "name email role")
      .populate("ngo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
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

// Update opportunity - NGO can update any, volunteers can only update their own
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, duration, location, status } = req.body;

    // Find opportunity - NGO can update any, volunteers can only update their own
    let opportunity;
    if (req.user.role === "ngo") {
      opportunity = await Opportunity.findById(id);
    } else {
      opportunity = await Opportunity.findOne({ _id: id, createdBy: req.user._id });
    }

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.requiredSkills = requiredSkills || opportunity.requiredSkills;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.status = status || opportunity.status;

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    console.error("Update Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete opportunity - NGO can only delete their own opportunities, volunteers can only delete their own
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    // First, find the opportunity to check who created it
    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Check if user has permission to delete
    // NGO can only delete opportunities they created
    // Volunteers can only delete opportunities they created
    const isCreator = opportunity.createdBy.toString() === req.user._id.toString();
    
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "You can only delete opportunities you created",
      });
    }

    // Delete the opportunity
    await Opportunity.findByIdAndDelete(id);

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

// Apply to an opportunity (for volunteers)
exports.applyToOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (opportunity.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This opportunity is not open for applications",
      });
    }

    // Check if user has already applied
    const alreadyApplied = opportunity.applicants.some(
      (applicant) => applicant.user.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this opportunity",
      });
    }

    // Add applicant
    opportunity.applicants.push({
      user: userId,
      status: "pending",
    });

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Apply to Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get my applications (for volunteers)
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const opportunities = await Opportunity.find({
      "applicants.user": userId,
    }).populate("ngo", "name email").populate("createdBy", "name email role");

    // Filter to show only user's applications
    const applications = opportunities.map((opp) => {
      const application = opp.applicants.find(
        (app) => app.user.toString() === userId.toString()
      );
      return {
        _id: opp._id,
        title: opp.title,
        description: opp.description,
        location: opp.location,
        duration: opp.duration,
        status: opp.status,
        ngo: opp.ngo,
        createdBy: opp.createdBy,
        createdByType: opp.createdByType,
        applicationStatus: application.status,
        appliedAt: application.appliedAt,
      };
    });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
