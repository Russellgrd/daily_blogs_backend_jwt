import jwt from 'jsonwebtoken';

export const signAccessJWT = (payload: {}, expiresIn: string | number) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY!, { expiresIn });
};

export const signRefreshJWT = (payload: {}, expiresIn: string | number) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY!, { expiresIn })
}

export const verifyAccessJWT = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY!);
        return { payload: decoded, expired: false };
    } catch (err: any) {
        return { payload: null, expired: err.message.includes("jwt expired") }
    }
}

export const verifyRefreshJWT = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY!)
        return { payload: decoded, expired: false }
    } catch (err: any) {
        return { payload: null, expired: err.message.includes("jwt expired") };
    }
}