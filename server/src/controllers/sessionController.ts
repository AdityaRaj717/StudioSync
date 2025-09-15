import Session from "../model/Session.ts";
import type { Request, Response } from "express";

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const sessions = await Session.find({ participants: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
