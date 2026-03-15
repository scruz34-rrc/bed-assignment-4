import { Request, Response } from "express";
import errorHandler from "../src/api/v1/middleware/errorHandler";
import {
    AuthenticationError,
    AuthorizationError,
} from "../src/api/v1/errors/errors";
import { HTTP_STATUS } from "../src/constants/httpConstants";

// Mock console.error to avoid cluttering test output
jest.spyOn(console, 'error').mockImplementation(() => {});

describe("Error Handler Middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRequest = {};
        mockResponse = {
            status: statusMock,
        };
    });

    it("should handle AuthenticationError with 401 status", () => {
        const error = new AuthenticationError("Invalid token", "TOKEN_INVALID");

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            jest.fn()
        );

        expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "Invalid token",
                code: "TOKEN_INVALID",
            },
            timestamp: expect.any(String),
        });
    });

    it("should handle AuthorizationError with 403 status", () => {
        const error = new AuthorizationError(
            "Insufficient permissions",
            "INSUFFICIENT_ROLE"
        );

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            jest.fn()
        );

        expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "Insufficient permissions",
                code: "INSUFFICIENT_ROLE",
            },
            timestamp: expect.any(String),
        });
    });
});