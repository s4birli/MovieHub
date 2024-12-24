import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import crypto from "crypto";
import User, { IUser } from "../models/User";
import sendEmail from "../utils/sendEmail";

const router = express.Router();

router.post(
    "/",
    [
        check("email", "Please include a valid Email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
                return;
            }

            const payload = { user: { id: user.id } };
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
                expiresIn: "7d",
            });

            const refreshToken = jwt.sign(
                payload,
                process.env.JWT_REFRESH_SECRET as string,
                { expiresIn: "7d" }
            );

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
                accessToken,
                refreshToken,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
            return;
        }
    }
);

router.post(
    "/register",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Please include a valid Email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({ min: 6 }),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { name, email, password } = req.body;

        try {
            let user: IUser | null = await User.findOne({ email });
            if (user) {
                res.status(400).json({ errors: [{ msg: "User already exists" }] });
                return;
            }

            user = new User({ name, email, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = { user: { id: user.id } };
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
                expiresIn: "15m",
            });
            const refreshToken = jwt.sign(
                payload,
                process.env.JWT_REFRESH_SECRET as string,
                { expiresIn: "7d" }
            );

            res.json({ accessToken, refreshToken });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/forgot-password",
    [check("email", "Please include a valid Email").isEmail()],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email } = req.body;

        try {
            const user: IUser | null = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ errors: [{ msg: "User not found" }] });
                return;
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenHash = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

            user.resetPasswordToken = resetTokenHash;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();

            const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
            const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the link to reset your password: ${resetUrl}`;

            await sendEmail({
                email: user.email,
                subject: "Password Reset Request",
                message,
            });

            res.json({ msg: "Password reset email sent" });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/reset-password/:resetToken",
    [
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({ min: 6 }),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const resetToken = req.params.resetToken;
        const { password } = req.body;

        try {
            const resetTokenHash = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

            const user: IUser | null = await User.findOne({
                resetPasswordToken: resetTokenHash,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                res.status(400).json({ errors: [{ msg: "Invalid or expired token" }] });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Clear reset token fields
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.json({ msg: "Password has been reset" });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/refresh-token",
    async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(401).json({ msg: "No refresh token provided" });
            return;
        }

        try {
            const payload = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as string
            ) as any;

            const accessToken = jwt.sign(
                { user: { id: payload.user.id } },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "15m",
                }
            );

            res.json({ accessToken });
        } catch (err) {
            console.error(err);
            res.status(403).json({ msg: "Invalid refresh token" });
        }
    }
);

export default router;