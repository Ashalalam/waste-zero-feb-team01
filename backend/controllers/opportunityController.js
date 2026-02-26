// In-memory opportunities storage (demo mode)
const opportunities = [];

// ==============================
// CREATE OPPORTUNITY (NGO only)
// ==============================
exports.createOpportunity = (req, res) => {
  try {
    const { title, description, requiredSkills, duration, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const opportunity = {
      id: Date.now().toString(),
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration: duration || "",
      location: location || "",
      status: "open",
      ngo: req.user.id, // from token
      createdAt: new Date(),
    };

    opportunities.push(opportunity);

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
exports.getAllOpportunities = (req, res) => {
  res.status(200).json({
    success: true,
    count: opportunities.length,
    opportunities,
  });
};

// ==============================
// GET SINGLE OPPORTUNITY
// ==============================
exports.getOpportunityById = (req, res) => {
  const opportunity = opportunities.find(op => op.id === req.params.id);

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
};

// ==============================
// UPDATE OPPORTUNITY (Owner only)
// ==============================
exports.updateOpportunity = (req, res) => {
  const opportunity = opportunities.find(op => op.id === req.params.id);

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: "Opportunity not found",
    });
  }

  if (opportunity.ngo !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this opportunity",
    });
  }

  const allowedFields = ["title", "description", "requiredSkills", "duration", "location", "status"];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      opportunity[field] = req.body[field];
    }
  });

  res.status(200).json({
    success: true,
    opportunity,
  });
};

// ==============================
// DELETE OPPORTUNITY (Owner only)
// ==============================
exports.deleteOpportunity = (req, res) => {
  const index = opportunities.findIndex(op => op.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Opportunity not found",
    });
  }

  if (opportunities[index].ngo !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this opportunity",
    });
  }

  opportunities.splice(index, 1);

  res.status(200).json({
    success: true,
    message: "Opportunity deleted successfully",
  });
};