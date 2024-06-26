import express from "express";
import { deleteMemberById, getMemberById, getMembers } from "../db/members";

export const getAllMembers = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { membername_like, email, YOB, _sort, _order, _id } = req.query;
    let query: any = {};

    if (membername_like) {
      query.membername = { $regex: membername_like, $options: "i" };
    }
    if (email) {
      query.email = { $regex: email, $options: "i" };
    }
    if (YOB) {
      query.YOB = Number(YOB);
    }
    if (_id) {
      query._id = _id;
    }

    let sort: any = {};
    if (_sort && _order) {
      sort[_sort as string] = _order === "asc" ? 1 : -1;
    }

    const membersQuery = getMembers().find(query).sort(sort);
    const members = await membersQuery.exec();
    const total = await getMembers().countDocuments(query).exec();

    res.setHeader("X-Total-Count", total);
    return res.status(200).json(members);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getMember = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { id } = req.params;
    const member = await getMemberById(id);
    if (!member) {
      return res.sendStatus(404);
    }
    return res.status(200).json(member);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const deleteMember = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { id } = req.params;
    const deletedMember = await deleteMemberById(id);
    if (!deletedMember) {
      return res.sendStatus(404);
    }
    return res.json(deletedMember);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const updateMember = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  try {
    const { id } = req.params;
    const { membername, YOB, isAdmin } = req.body;

    const member = await getMemberById(id);
    if (!member) {
      return res.sendStatus(404);
    }

    if (membername !== undefined) member.membername = membername;
    if (YOB !== undefined) member.YOB = YOB;
    if (isAdmin !== undefined) member.isAdmin = isAdmin;

    await member.save();
    return res.status(200).json(member).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
