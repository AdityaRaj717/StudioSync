import jwt from "jsonwebtoken";
import User from "../model/User.ts";
import type { Request, Response } from "express";

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const newUser = new User({
      email: email.toLowerCase(),
      password,
      name,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ sub: savedUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    res.status(201).json({ user: savedUser });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = (req: Request, res: Response) => {
  const token = jwt.sign(
    { sub: (req.user as any)._id },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  res.status(200).json({ user: req.user });
};

export const googleCallback = (req: Request, res: Response) => {
  try {
    const token = jwt.sign(
      {
        sub: (req.user as any)._id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.redirect(`${process.env.UI_URL}/success-login`);
  } catch (error) {
    console.error("Error during google callback", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    res.json({ user: req.user });
  } catch (error) {
    console.error("Error fetching user details", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
