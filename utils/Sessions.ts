import jwt from 'jsonwebtoken';

export const sessions: Record<
    string,
    { sessionId: string; email: string; valid: boolean }
> = {};

export const createSession = (email: string) => {
    const sessionId = String(Object.keys(sessions).length + 1);
    const session = { sessionId, email, valid: true };
    sessions[sessionId] = session;
    return session;
}

export const getSession = (sessionId: string) => {
    const session = sessions[sessionId];
    return session && session.valid ? session : null;
}

export const invalidateSession = (sessionId: string) => {
    const session = sessions[sessionId];
    if (session) {
        session.valid = false;
    }
    return sessions[sessionId];
}


