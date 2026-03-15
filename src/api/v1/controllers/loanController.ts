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
        res.status(HTTP_STATUS.OK).json({
            message: "Loan applications retrieved",
            count: loans.length,
            data: loans
        });
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
        
        res.status(HTTP_STATUS.OK).json({
            message: "Loan application retrieved",
            data: loan
        });
    }
    
    catch (error) {
        next(error);
    }
};

export const createLoanHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { applicant, amount } = req.body;
        
        if (!applicant || !amount) {
            throw new ServiceError(
                "Applicant name and amount are required",
                "MISSING_FIELDS",
                HTTP_STATUS.BAD_REQUEST
            );
        }
        
        if (typeof amount !== 'number' || amount <= 0) {
            throw new ServiceError(
                "Amount must be a positive number",
                "INVALID_AMOUNT",
                HTTP_STATUS.BAD_REQUEST
            );
        }
        
        const newLoan: Loan = {
            id: loans.length + 1,
            applicant,
            amount,
            status: "pending",
            createdAt: new Date().toISOString()
        };
        
        loans.push(newLoan);
        
        res.status(HTTP_STATUS.CREATED).json({
            message: "Loan application created",
            data: newLoan
        });
    }
    
    catch (error) {
        next(error);
    }
};