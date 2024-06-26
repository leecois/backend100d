import express from "express";

import {
  addCommentToWatch,
  createNewWatch,
  deleteCommentFromWatch,
  deleteWatch,
  getAllWatches,
  getWatch,
  updateCommentInWatch,
  updateWatch,
} from "../controllers/watches";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/watches", getAllWatches);
  router.get("/watches/:id", getWatch);
  router.post("/watches", isAuthenticated, createNewWatch);
  router.patch("/watches/:id", isAuthenticated, updateWatch);
  router.delete("/watches/:id", isAuthenticated, deleteWatch);
  router.post("/watches/:id/comments", isAuthenticated, addCommentToWatch);
  router.patch(
    "/watches/:watchId/comments/:commentId",
    isAuthenticated,
    updateCommentInWatch
  );
  router.delete(
    "/watches/:watchId/comments/:commentId",
    isAuthenticated,
    deleteCommentFromWatch
  );
};
