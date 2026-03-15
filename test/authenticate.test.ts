import { Request, Response, NextFunction } from "express";
import authenticate from "../src/api/v1/middleware/authenticate";
import { auth } from "../src/config/firebaseConfig";
import { AuthenticationError } from "../src/api/v1/errors/errors";

// Mock Firebase auth
jest.mock("../src/config/firebaseConfig", () => ({
    auth: {
        verifyIdToken: jest.fn(),
    },
}));

describe("Authentication Middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            locals: {},
        };
        nextFunction = jest.fn();
    });

    it("should call next with AuthenticationError when no token is provided", async () => {
        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthenticationError)
        );
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Unauthorized: No token provided");
        expect(error.code).toBe("TOKEN_NOT_FOUND");
        expect(error.statusCode).toBe(401);
    });

    it("should call next with AuthenticationError when token is invalid", async () => {
        mockRequest.headers = {
            authorization: "Bearer invalid-token",
        };

        (auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(
            new Error("Invalid token")
        );

        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthenticationError)
        );
    });

    it("should call next() and set user data when token is valid", async () => {
        mockRequest.headers = {
            authorization: "Bearer valid-token",
        };

        (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
            uid: "test-uid",
            role: "admin",
        });

        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token");
        expect(mockResponse.locals).toEqual({
            uid: "test-uid",
            role: "admin",
        });
        expect(nextFunction).toHaveBeenCalledWith();
    });
});