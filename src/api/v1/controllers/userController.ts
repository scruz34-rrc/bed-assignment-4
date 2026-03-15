import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { ServiceError } from "../errors/errors";

/**
 * Handles user sign-in and returns tokens in the format shown in the demo video.
 * This acts as a proxy to Firebase Authentication REST API.
 */
export const signInHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ServiceError(
                "Email and password are required",
                "MISSING_CREDENTIALS",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const response = await fetch(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAitKubTFYfiYmPgH4lfi94XLREYMyHGNI",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new ServiceError(
                data.error?.message || "Authentication failed",
                "AUTH_FAILED",
                HTTP_STATUS.UNAUTHORIZED
            );
        }

        res.status(HTTP_STATUS.OK).json({
            idToken: data.idToken,
            email: data.email,
            localId: data.localId,
            expiresIn: data.expiresIn,
            refreshToken: data.refreshToken
        });
    } catch (error) {
        next(error);
    }
};