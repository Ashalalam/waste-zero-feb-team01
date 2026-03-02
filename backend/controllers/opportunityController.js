const Opportunity = require("../models/Opportunity");
const mongoose = require("mongoose");

/* ── Helper: validate ObjectId ───────────────────────────────── */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ──────────────────────────────────────────────────────────────
   CREATE  POST /opportunities
   Only NGO role (enforced by roleMiddleware before this)
────────────────────────────────────────────────────────────── */
const createOpportunity = async (req, res, next) => {
  try {
    const { title, description, required_skills, duration, location, status } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: "title, description, duration and location are required",
      });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      required_skills: required_skills || [],
      duration,
      location,
      status: status || "open",
      ngo_id: req.user._id,   // extracted from JWT via authMiddleware
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   GET ALL  GET /opportunities
   Public or authenticated. Supports filters: location, skills, status
────────────────────────────────────────────────────────────── */
const getAllOpportunities = async (req, res, next) => {
  try {
    const { location, skills, status } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (status) {
      filter.status = status.toLowerCase();
    }

    if (location) {
      // case-insensitive partial match
      filter.location = { $regex: location, $options: "i" };
    }

    if (skills) {
      // skills can be comma-separated: ?skills=React,teamwork
      const skillsArray = skills.split(",").map((s) => s.trim());
      filter.required_skills = { $in: skillsArray };
    }

    const opportunities = await Opportunity.find(filter)
      .populate("ngo_id", "name location email")   // populate NGO details
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   GET ONE  GET /opportunities/:id
────────────────────────────────────────────────────────────── */
const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findById(id)
      .populate("ngo_id", "name location email bio");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   UPDATE  PUT /opportunities/:id
   Only the NGO that created it can update
────────────────────────────────────────────────────────────── */
const updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Ownership check — only the NGO who created it can update
    if (opportunity.ngo_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only edit your own opportunities",
      });
    }

    // Only allow these fields to be updated — ngo_id is never allowed
    const { title, description, required_skills, duration, location, status } = req.body;

    const allowedUpdates = {};
    if (title)             allowedUpdates.title           = title;
    if (description)       allowedUpdates.description     = description;
    if (required_skills)   allowedUpdates.required_skills = required_skills;
    if (duration)          allowedUpdates.duration        = duration;
    if (location)          allowedUpdates.location        = location;
    if (status)            allowedUpdates.status          = status;

    const updated = await Opportunity.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate("ngo_id", "name location email");

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   DELETE  DELETE /opportunities/:id
   Only the NGO that created it can delete
────────────────────────────────────────────────────────────── */
const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      throw new ApiError("Opportunity not found", 404);
    }

    // Ownership check
    if (opportunity.ngo_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own opportunities",
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
};