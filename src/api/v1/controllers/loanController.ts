import { Request, Response, NextFunction } from "express";
import { loans, Loan } from "../models/loanModel";
import { successResponse } from "../models/responseModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { ServiceError } from "../errors/errors";

export const getAllLoansHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.status(HTTP_STATUS.OK).json(
            successResponse(
                loans,
                "Loan applications retrieved"
            )
        );
    } catch (error) {
        next(error);
    }
};