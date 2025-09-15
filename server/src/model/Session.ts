import mongoose, { Document, Schema } from "mongoose";

interface ISession extends Document {
  roomId: string;
  participants: mongoose.Types.ObjectId[];
  status: "active" | "completed";
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
