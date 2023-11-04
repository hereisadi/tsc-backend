import { User } from "../../models/LocalAuth/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError, CSuccess } from "../../utils/ChalkCustomStyles";
import jwt from "jsonwebtoken";
import dotEnv from "dotenv";
dotEnv.config();

import rateLimit from "express-rate-limit";
import { isEmail } from "../../utils/isEmail";

const YOUR_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

const emailLimiter = rateLimit({
  windowMs: 15 * 1000, //15s
  max: 5, // limit each IP to 5 requests per windowMs
  keyGenerator: (req: Request) => req.body.email,
  handler: (req: Request, res: Response) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  },
});

export const login = async (req: Request, res: Response) => {
  emailLimiter(req, res, async () => {
    isEmail(req, res, async () => {
      let { email, password } = req.body as {
        email: string;
        password: string;
      };

      email = email.toString().trim();
      password = password.toString().trim();

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: "No account found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          YOUR_SECRET_KEY!,
          { expiresIn: "720h" }
        );

        res.status(200).json({ message: "Login successful", token });
        CSuccess("login successful");
      } catch (error) {
        CError("Failed to log in");
        res.status(500).json({ error: "Failed to log in" });
        console.error(error);
      }
    });
  });
};
