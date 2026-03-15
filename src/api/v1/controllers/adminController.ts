import { Request, Response, NextFunction } from "express";
import { auth } from "../../../config/firebaseConfig";
import { successResponse } from "../models/responseModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { ServiceError } from "../errors/errors";

export const setCustomClaims = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { uid, role } = req.body;
        
        if (!uid || !role) {
            throw new ServiceError(
                "UID and role are required",
                "MISSING_FIELDS",
                HTTP_STATUS.BAD_REQUEST
            );
        }
        
        if (!["officer", "manager", "admin"].includes(role)) {
            throw new ServiceError(
                "Role must be one of: officer, manager, admin",
                "INVALID_ROLE",
                HTTP_STATUS.BAD_REQUEST
            );
        }
        
        await auth.setCustomUserClaims(uid, { role });
        
        const user = await auth.getUser(uid);
        
        res.status(HTTP_STATUS.OK).json(
            successResponse(
                {
                    uid: user.uid,
                    email: user.email,
                    role: user.customClaims?.role
                },
                `Custom claims set for user: ${uid}. User must obtain a new token for changes to take effect.`
            )
        );
    }
    
    catch (error) {
        next(error);
    }
};