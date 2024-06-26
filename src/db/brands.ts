import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true },
  },
  { timestamps: true }
);

export const BrandsModel = mongoose.model("Brand", brandSchema);

export const getBrands = () => BrandsModel.find().exec();
export const getBrandById = (id: string) => BrandsModel.findById(id).exec();
export const createBrand = (values: Record<string, any>) =>
  new BrandsModel(values).save().then((brand) => brand.toObject());
export const deleteBrandById = (id: string) =>
  BrandsModel.findOneAndDelete({ _id: id }).exec();
export const updateBrandById = (id: string, values: Record<string, any>) =>
  BrandsModel.findByIdAndUpdate(id, values, { new: true }).exec();
