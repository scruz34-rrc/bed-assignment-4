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
    }
    
    catch (error) {
        next(error);
    }
};

export const getLoanByIdHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const loanId = parseInt(id);
        
        const loan = loans.find(l => l.id === loanId);
        
        if (!loan) {
            throw new ServiceError(
                `Loan with ID ${id} not found`,
                "LOAN_NOT_FOUND",
                HTTP_STATUS.NOT_FOUND
            );
        }
        
        res.status(HTTP_STATUS.OK).json(
            successResponse(
                loan,
                "Loan application retrieved"
            )
        );
    }
    
    catch (error) {
        next(error);
    }
};