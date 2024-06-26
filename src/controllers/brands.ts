import { Request, Response } from "express";
import {
  createBrand,
  deleteBrandById,
  getBrandById,
  getBrands,
  updateBrandById,
} from "../db/brands";
import { getWatchesByBrandId } from "../db/watches";

export const getAllBrands = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const brands = await getBrands();
    return res.status(200).json(brands);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error fetching brands" });
  }
};

export const getBrand = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const brand = await getBrandById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.status(200).json({ brand, user: req.user });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error fetching brand" });
  }
};

export const getWatchesByBrand = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const watches = await getWatchesByBrandId(id);
    if (!watches) {
      return res
        .status(404)
        .json({ message: "Watches not found for this brand" });
    }
    return res.status(200).json(watches);
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Error fetching watches for brand" });
  }
};

export const createNewBrand = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const brandData = req.body;
    const newBrand = await createBrand(brandData);
    return res.status(201).json(newBrand);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error creating brand" });
  }
};

export const updateBrand = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const brandData = req.body;

    const updatedBrand = await updateBrandById(id, brandData);
    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return res.status(200).json(updatedBrand);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error updating brand" });
  }
};

export const deleteBrand = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const watches = await getWatchesByBrandId(id);
    if (watches.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete brand with watches" });
    }

    const deletedBrand = await deleteBrandById(id);
    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error deleting brand" });
  }
};
