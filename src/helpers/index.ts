import crypto from "crypto";
import { Request } from "express";
import { get } from "lodash";
import { MemberModel } from "../db/members";

const SECRET = "LEECOIS-REST-API";

export const random = () => crypto.randomBytes(128).toString("base64");

export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};
export const getUserFromRequest = async (req: Request) => {
  try {
    const currentMemberId = get(req, "identity._id") as unknown as string;

    if (!currentMemberId) {
      return null;
    }

    const user = await MemberModel.findById(currentMemberId);
    return user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
