// dbController.js
const Card = require("./card");
const Project = require("./project");

// Project controllers
exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase UID
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      userId: req.user.uid,
    });
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.uid,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({
      _id: req.params.projectId,
      userId: req.user.uid,
    });
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(deletedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.uid,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Card controllers
exports.getCardsByProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.uid,
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or not owned by user" });
    }

    const cards = await Card.find({ projectId: req.params.projectId });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const card = new Card({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || "todo",
      projectId: req.params.projectId,
      userId: req.user.uid,
    });
    const newCard = await card.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findOne({
      _id: req.params.cardId,
      projectId: req.params.projectId,
      userId: req.user.uid,
    });
    if (!card) {
      return res
        .status(404)
        .json({ message: "Card not found or not owned by user" });
    }

    card.title = req.body.title ?? card.title;
    card.description = req.body.description ?? card.description;
    card.status = req.body.status ?? card.status;

    const updatedCard = await card.save();
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const deletedCard = await Card.findOneAndDelete({
      _id: req.params.cardId,
      projectId: req.params.projectId,
      userId: req.user.uid,
    });
    if (!deletedCard) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.status(200).json(deletedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
