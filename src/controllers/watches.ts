import { Request, Response } from "express";
import { get } from "lodash";
import mongoose from "mongoose";
import {
  createWatch,
  deleteWatchById,
  updateWatchById,
  WatchesModel,
} from "../db/watches";

export const getAllWatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { watchName_like, watchDescription_like, brand, _sort, _order } =
      req.query as {
        watchName_like?: string;
        watchDescription_like?: string;
        brand?: string;
        _sort?: string;
        _order?: "asc" | "desc";
      };

    let query: any = {};

    if (watchName_like) {
      query.watchName = { $regex: watchName_like, $options: "i" };
    }
    if (watchDescription_like) {
      query.watchDescription = { $regex: watchDescription_like, $options: "i" };
    }
    if (brand) {
      query.brand = brand;
    }

    let sort: any = {};
    if (_sort && _order) {
      sort[_sort] = _order === "asc" ? 1 : -1;
    }

    const watches = await WatchesModel.find(query)
      .sort(sort)
      .populate("brand", "brandName")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "membername email",
        },
      })
      .exec();

    const total = await WatchesModel.countDocuments(query);

    res.set("X-Total-Count", total.toString());
    res.status(200).json(watches);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
};

export const getWatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const watch = await WatchesModel.findById(id)
      .populate("brand")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "membername email",
        },
      })
      .exec();
    if (!watch) {
      res.sendStatus(404);
      return;
    }
    res.status(200).json(watch);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
};

export const createNewWatch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const watchData = req.body;

    const newWatch = await createWatch(watchData);
    return res.status(201).json(newWatch);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const deleteWatch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedWatch = await deleteWatchById(id);
    if (!deletedWatch) {
      return res.sendStatus(404);
    }
    return res.status(200).json(deletedWatch);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const updateWatch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const watchData = req.body;

    const updatedWatch = await updateWatchById(id, watchData);
    if (!updatedWatch) {
      return res.sendStatus(404);
    }

    return res.status(200).json(updatedWatch);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
export const addCommentToWatch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;
    const author = get(
      req,
      "identity._id"
    ) as unknown as mongoose.Types.ObjectId;
    const isAdmin = get(req, "identity.isAdmin");

    if (isAdmin) {
      return res.status(403).json({ message: "Admins cannot comment" });
    }

    const watch = await WatchesModel.findById(id);
    if (!watch) {
      return res.sendStatus(404);
    }

    const existingComment = watch.comments.find(
      (comment) => comment.author.toString() === author.toString()
    );

    if (existingComment) {
      return res
        .status(400)
        .json({ message: "User has already commented on this watch" });
    }

    watch.comments.push({ rating, content, author });
    await watch.save();

    return res.status(201).json(watch);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
export const updateCommentInWatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { watchId, commentId } = req.params;
    const { rating, content } = req.body;
    const author = get(
      req,
      "identity._id"
    ) as unknown as mongoose.Types.ObjectId;

    const watch = await WatchesModel.findById(watchId);
    if (!watch) {
      res.sendStatus(404);
      return;
    }

    const comment = watch.comments.id(commentId);
    if (!comment) {
      res.sendStatus(404);
      return;
    }

    if (comment.author.toString() !== author.toString()) {
      res
        .status(403)
        .json({ message: "You can only update your own comments" });
      return;
    }

    comment.rating = rating;
    comment.content = content;
    await watch.save();

    res.status(200).json(watch);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
};
export const deleteCommentFromWatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { watchId, commentId } = req.params;
    const author = get(
      req,
      "identity._id"
    ) as unknown as mongoose.Types.ObjectId;

    const watch = await WatchesModel.findById(watchId);
    if (!watch) {
      res.sendStatus(404);
      return;
    }

    const comment = watch.comments.id(commentId);
    if (!comment) {
      res.sendStatus(404);
      return;
    }

    if (comment.author.toString() !== author.toString()) {
      res
        .status(403)
        .json({ message: "You can only delete your own comments" });
      return;
    }

    watch.comments.pull(comment);
    await watch.save();

    res.status(200).json(watch);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
};
