import request from "supertest";
import app from "../src/app";
import { auth } from "../src/config/firebaseConfig";

jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Firebase auth
jest.mock("../src/config/firebaseConfig", () => ({
    auth: {
        verifyIdToken: jest.fn(),
    },
}));

describe("Loan Routes - Authentication & Authorization Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/v1/loans - All authenticated users", () => {
        it("should return 401 when no token provided", async () => {
            const response = await request(app)
                .get("/api/v1/loans");

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
                success: false,
                error: {
                    message: "Unauthorized: No token provided",
                    code: "TOKEN_NOT_FOUND",
                },
            });
        });

        it("should return 200 with valid token", async () => {
            (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                uid: "user123",
                role: "user",
            });

            const response = await request(app)
                .get("/api/v1/loans")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Loan applications retrieved");
        });
    });

    describe("POST /api/v1/loans - Requires manager or admin role", () => {
        it("should return 403 when user has insufficient role (user)", async () => {
            (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                uid: "user123",
                role: "user",
            });

            const response = await request(app)
                .post("/api/v1/loans")
                .set("Authorization", "Bearer user-token")
                .send({ applicant: "Test User", amount: 50000 });

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
                success: false,
                error: {
                    message: "Forbidden: Insufficient role",
                    code: "INSUFFICIENT_ROLE",
                },
            });
        });

        it("should return 201 when user has manager role", async () => {
            (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                uid: "manager123",
                role: "manager",
            });

            const response = await request(app)
                .post("/api/v1/loans")
                .set("Authorization", "Bearer manager-token")
                .send({ applicant: "Test User", amount: 50000 });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Loan application created");
        });
    });

    describe("DELETE /api/v1/loans/:id - Requires admin role only", () => {
        it("should return 403 when user has manager role", async () => {
            (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                uid: "manager123",
                role: "manager",
            });

            const response = await request(app)
                .delete("/api/v1/loans/1")
                .set("Authorization", "Bearer manager-token");

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
                success: false,
                error: {
                    message: "Forbidden: Insufficient role",
                    code: "INSUFFICIENT_ROLE",
                },
            });
        });

        it("should return 200 when user has admin role", async () => {
            (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                uid: "admin123",
                role: "admin",
            });

            const response = await request(app)
                .delete("/api/v1/loans/1")
                .set("Authorization", "Bearer admin-token");

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Loan application deleted");
        });
    });
});