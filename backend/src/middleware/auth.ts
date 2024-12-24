import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const auth = (
    req: Request & { user?: { id: string } },
    res: Response,
    next: NextFunction
): void => {
    const token = req.header("x-auth-token");

    if (!token) {
        res.status(401).json({ msg: "No token, authorization denied" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};

export default auth; 