import express from "express";
import { get, merge } from "lodash";
import { getMemberBySessionToken, MemberModel } from "../db/members";

const extractBearerToken = (header: string | undefined) => {
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
};

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentMemberId = get(req, "identity._id") as unknown as string;

    if (!currentMemberId) {
      return res.sendStatus(403);
    }

    if (currentMemberId.toString() !== id) {
      return res.sendStatus(403);
    }
    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const tokenFromHeader = extractBearerToken(authHeader);
    const tokenFromCookie = req.cookies["LEECOIS-AUTH"];
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.sendStatus(400);
    }

    const existingMember = await getMemberBySessionToken(token);
    if (!existingMember) {
      return res.sendStatus(403);
    }
    merge(req, { identity: existingMember });
    return next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const isAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const currentMemberId = get(req, "identity._id") as unknown as string;

    if (!currentMemberId) {
      return res.sendStatus(403);
    }

    const user = await MemberModel.findById(currentMemberId);
    if (user && user.isAdmin) {
      return next();
    }
    res.sendStatus(403);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
