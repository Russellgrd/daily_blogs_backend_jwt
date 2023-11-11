import { Request, Response, NextFunction } from "express"
import UserModel from '../models/User.js';
import jwt from 'jsonwebtoken';

type JwtPayload = {
    email: string,
    iat: number,
    eat: number
}

type JwtError = {
    message: string
}

export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    //check if user has a accesstoken, if not next
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken) return next();
    //user has access token so validate
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY!) as JwtPayload;
        const { email } = decoded
        //@ts-ignore
        req.user = { email };
        return next();
    } catch (err: unknown) {
        //if invalid sig return.
        const knownError = err as JwtError;
        if (knownError.message.includes("invalid signature")) {
            return res.status(401).json(err);
        };
        //if valid but expired
        if (knownError.message.includes("jwt expired")) {
            //validate refreshToken
            try {
                if (!refreshToken) {
                    return next();
                }
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY!) as JwtPayload;
                const { email } = decoded;
                const dbUser = await UserModel.findOne({ email })
                if (dbUser?.refreshToken === refreshToken) {
                    console.log('issuing a new token');
                    //database refresh token matches cookie refresh token and validated.  return new access token
                    const newAccessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_KEY!, { expiresIn: "30m" });
                    res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 });
                    return next();
                } else {
                    return res.status(401).json({ message: "RefreshToken invalid" });
                }

            } catch (err) {
                return res.status(401).json(err);
            }

        }
    }
}