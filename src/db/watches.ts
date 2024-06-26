import mongoose from "mongoose";
import { commentSchema } from "./comments";

const watchSchema = new mongoose.Schema(
  {
    watchName: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    automatic: { type: Boolean, default: false },
    watchDescription: { type: String, required: true },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

export const WatchesModel = mongoose.model("Watch", watchSchema);

export const getWatches = () => WatchesModel.find().populate("brand").exec();

export const getWatchById = (id: string) =>
  WatchesModel.findById(id).populate("brand").exec();

export const createWatch = (values: Record<string, any>) =>
  new WatchesModel(values).save().then((watch) => watch.toObject());

export const deleteWatchById = (id: string) =>
  WatchesModel.findOneAndDelete({ _id: id }).exec();

export const updateWatchById = (id: string, values: Record<string, any>) =>
  WatchesModel.findByIdAndUpdate(id, values, { new: true }).exec();

export const getWatchesByBrandId = (brandId: string) =>
  WatchesModel.find({ brand: brandId }).populate("brand").exec();
