import { Request, Response } from "express";
import {
  createMember,
  getMemberByEmail,
  updateMemberById,
} from "../db/members";
import { authentication, getUserFromRequest, random } from "../helpers";

const sendError = (res: Response, status: number, error: any) => {
  console.error(error);
  res.sendStatus(status);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, "Email or password missing");
  }

  try {
    const member = await getMemberByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (
      !member ||
      !member.authentication ||
      !member.authentication.salt ||
      !member.authentication.password
    ) {
      return sendError(res, 400, "Authentication details are missing");
    }

    const expectedHash = authentication(member.authentication.salt, password);
    if (expectedHash !== member.authentication.password) {
      return sendError(res, 403, "Invalid credentials");
    }

    const salt = random();
    member.authentication.sessionToken = authentication(
      salt,
      member._id.toString()
    );
    await member.save();

    res.cookie("LEECOIS-AUTH", member.authentication.sessionToken, {
      httpOnly: true,
      domain: "localhost",
      path: "/",
    });
    res.status(200).json(member).end();
  } catch (error) {
    sendError(res, 400, error);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { membername, email, password } = req.body;

  if (!membername || !email || !password) {
    return sendError(res, 400, "Membername, email, or password missing");
  }

  try {
    const existingMember = await getMemberByEmail(email);
    if (existingMember) {
      return sendError(res, 409, "Member already exists");
    }

    const salt = random();
    if (!salt) {
      return sendError(res, 500, "Failed to generate salt");
    }

    const hashedPassword = authentication(salt, password);
    if (!hashedPassword) {
      return sendError(res, 500, "Failed to hash password");
    }

    const member = await createMember({
      membername,
      email,
      isAdmin: false,
      YOB: 0,
      authentication: {
        password: hashedPassword,
        salt,
      },
    });

    res.status(200).json(member);
  } catch (error) {
    sendError(res, 400, error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return sendError(res, 400, "Email or new password missing");
  }

  try {
    const member = await getMemberByEmail(email).select("+authentication.salt");

    if (!member || !member.authentication || !member.authentication.salt) {
      return sendError(
        res,
        400,
        "Member not found or authentication details are missing"
      );
    }

    const newSalt = random();
    const newHashedPassword = authentication(newSalt, newPassword);

    await updateMemberById(member._id, {
      "authentication.salt": newSalt,
      "authentication.password": newHashedPassword,
    });

    res.status(200).json({ message: "Password reset successful" }).end();
  } catch (error) {
    sendError(res, 400, error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await getUserFromRequest(req);

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return sendError(res, 400, "All password fields are required");
  }

  if (newPassword !== confirmNewPassword) {
    return sendError(res, 400, "New passwords do not match");
  }

  try {
    const member = await getMemberByEmail(user?.email as string).select(
      "+authentication.salt +authentication.password"
    );

    if (
      !member ||
      !member.authentication ||
      !member.authentication.salt ||
      !member.authentication.password
    ) {
      return sendError(res, 400, "Authentication details are missing");
    }

    const expectedHash = authentication(
      member.authentication.salt,
      currentPassword
    );
    if (expectedHash !== member.authentication.password) {
      return sendError(res, 403, "Current password is incorrect");
    }

    const newSalt = random();
    const newHashedPassword = authentication(newSalt, newPassword);

    await updateMemberById(member._id, {
      "authentication.salt": newSalt,
      "authentication.password": newHashedPassword,
    });

    res.status(200).json({ message: "Password change successful" }).end();
  } catch (error) {
    sendError(res, 400, error);
  }
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const member = req.user as any;
    const sessionToken = member.authentication.sessionToken;
    res.cookie("LEECOIS-AUTH", sessionToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: "localhost",
      path: "/",
    });
    const user = {
      _id: member._id,
      membername: member.membername,
      email: member.email,
      YOB: member.YOB,
      isAdmin: member.isAdmin,
    };
    res.redirect(
      `http://localhost:5173/auth/google/callback?token=${sessionToken}&user=${encodeURIComponent(
        JSON.stringify(user)
      )}`
    );
  } catch (error) {
    console.error("Error setting session token cookie:", error);
    res.redirect("http://localhost:5173/auth/login");
  }
};
