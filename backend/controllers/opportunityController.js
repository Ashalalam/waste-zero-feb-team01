const Opportunity = require("../models/Opportunity");

// Create a new opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, requiredSkills, duration, location, status } = req.body;

    if (!title || !description || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, duration, and location are required",
      });
    }

    const createdByType = req.user.role === "ngo" ? "ngo" : "volunteer";

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration,
      location,
      status: status || "open",
      createdBy: req.user._id,
      createdByType: createdByType,
      ngo: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      opportunity,
    });
  } catch (error) {
    console.error("Create Opportunity Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ createdBy: req.user._id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error("Get Opportunities Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllOpportunitiesForNgo = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("createdBy", "name email role")
      .populate("ngo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error("Get All Opportunities for NGO Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ status: "open" })
      .populate("createdBy", "name email role")
      .populate("ngo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error("Get All Opportunities Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id)
      .populate("createdBy", "name email role")
      .populate("ngo", "name email");

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    res.status(200).json({ success: true, opportunity });
  } catch (error) {
    console.error("Get Opportunity Error:", error);
    res.status(400).json({ success: false, message: "Invalid opportunity ID" });
  }
};

// ── FIXED: NGO can only update opportunities THEY created ─────
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, duration, location, status } = req.body;

    // Always check ownership — createdBy must match logged-in user
    const opportunity = await Opportunity.findOne({ _id: id, createdBy: req.user._id });

    if (!opportunity) {
      return res.status(403).json({
        success: false,
        message: "You can only edit opportunities you created",
      });
    }

    opportunity.title          = title          || opportunity.title;
    opportunity.description    = description    || opportunity.description;
    opportunity.requiredSkills = requiredSkills || opportunity.requiredSkills;
    opportunity.duration       = duration       || opportunity.duration;
    opportunity.location       = location       || opportunity.location;
    opportunity.status         = status         || opportunity.status;

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    console.error("Update Opportunity Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete — ownership check already correct, unchanged
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    const isCreator = opportunity.createdBy.toString() === req.user._id.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "You can only delete opportunities you created",
      });
    }

    await Opportunity.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Delete Opportunity Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.applyToOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    if (opportunity.status !== "open") {
      return res.status(400).json({ success: false, message: "This opportunity is not open for applications" });
    }

    const alreadyApplied = opportunity.applicants.some(
      (applicant) => applicant.user.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "You have already applied to this opportunity" });
    }

    opportunity.applicants.push({ user: userId, status: "pending" });
    await opportunity.save();

    res.status(200).json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Apply to Opportunity Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const opportunities = await Opportunity.find({
      "applicants.user": userId,
    }).populate("ngo", "name email").populate("createdBy", "name email role");

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

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};