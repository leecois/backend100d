import express from "express";

import { getAllMembers, getMember, updateMember } from "../controllers/members";
import { isAdmin, isAuthenticated, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.get("/members", isAuthenticated, isAdmin, getAllMembers);
  router.get("/members/:id", isAuthenticated, isOwner, getMember);
  router.patch("/members/:id", isAuthenticated, isOwner, updateMember);
};
