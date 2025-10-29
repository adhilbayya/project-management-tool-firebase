const express = require("express");
const router = express.Router();
const dbController = require("./dbController");
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// Protect all routes with Firebase
router.use(verifyFirebaseToken);

// Project routes
router.get("/projects", dbController.getAllProjects);
router.post("/projects", dbController.createProject);
router.get("/projects/:projectId", dbController.getProjectById);
router.put("/projects/:projectId", dbController.updateProject);
router.delete("/projects/:projectId", dbController.deleteProject);

// Card routes
router.get("/projects/:projectId/cards", dbController.getCardsByProject);
router.post("/projects/:projectId/cards", dbController.createCard);
router.put("/projects/:projectId/cards/:cardId", dbController.updateCard);
router.delete("/projects/:projectId/cards/:cardId", dbController.deleteCard);

module.exports = router;
