import mongoose, { Document, Schema } from "mongoose";

interface Authentication {
  password?: string;
  salt?: string;
  sessionToken?: string;
}

export interface MemberDocument extends Document {
  membername: string;
  email: string;
  YOB?: number;
  googleId?: string;
  isAdmin: boolean;
  authentication?: Authentication;
}

const AuthenticationSchema = new Schema<Authentication>({
  password: { type: String, select: false },
  salt: { type: String, select: false },
  sessionToken: { type: String, select: false },
});

const MemberSchema = new Schema<MemberDocument>(
  {
    membername: { type: String, required: true },
    email: { type: String, required: true },
    YOB: { type: Number },
    googleId: { type: String, select: false },
    isAdmin: { type: Boolean, required: true, default: false },
    authentication: {
      type: AuthenticationSchema,
      required: false,
    },
  },
  { timestamps: true }
);

export const MemberModel = mongoose.model<MemberDocument>(
  "Member",
  MemberSchema
);

export const getMembers = () => MemberModel.find();
export const getMemberByEmail = (email: string) =>
  MemberModel.findOne({ email });
export const getMemberBySessionToken = (sessionToken: string) =>
  MemberModel.findOne({ "authentication.sessionToken": sessionToken });
export const getMemberById = (id: string) => MemberModel.findById(id);
export const createMember = (values: Record<string, any>) =>
  new MemberModel(values).save().then((member) => member.toObject());
export const deleteMemberById = (id: string) =>
  MemberModel.findOneAndDelete({ _id: id });
export const updateMemberById = (id: string, values: Record<string, any>) =>
  MemberModel.findByIdAndUpdate(id, values, { new: true });
