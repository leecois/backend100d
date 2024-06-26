import express from "express";
import {
  createNewBrand,
  deleteBrand,
  getAllBrands,
  getBrand,
  updateBrand,
} from "../controllers/brands";
import { isAdmin, isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/brands", getAllBrands);
  router.get("/brands/new", isAuthenticated, isAdmin, (req, res) => {
    res.render("brand-form", { brand: null });
  });
  router.get("/brands/:id", isAuthenticated, getBrand);
  router.delete("/brands/:id", isAuthenticated, isAdmin, deleteBrand);
  router.post("/brands", isAuthenticated, isAdmin, createNewBrand);
  router.patch("/brands/:id", isAuthenticated, isAdmin, updateBrand);
};
