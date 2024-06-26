import express from "express";
import passport from "passport";
import {
  changePassword,
  googleCallback,
  login,
  register,
  resetPassword,
} from "../controllers/authentication";
import { isAuthenticated, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post("/auth/reset-password", isAuthenticated, isOwner, resetPassword);
  router.post(
    "/auth/change-password/:id",
    isAuthenticated,
    isOwner,
    changePassword
  );

  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    googleCallback
  );

  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
};
