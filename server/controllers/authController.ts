import jwt from "jsonwebtoken";

export const googleCallback = (req: Request, res: Response) => {
  try {
    const token = jwt.sign(
      {
        sub: req.user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    // res.redirect(`${process.env.UI_URL}/success-login?access_token=${token}`);
    res.redirect(`https://localhost:5173/success-login?access_token=${token}`);
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
