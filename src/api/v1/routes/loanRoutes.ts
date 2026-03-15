import express from "express";
import {
    getAllLoansHandler,
    getLoanByIdHandler,
    createLoanHandler,
    updateLoanHandler,
    deleteLoanHandler
} from "../controllers/loanController";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router = express.Router();

router.use(authenticate);
router.get("/", getAllLoansHandler);
router.get("/:id", getLoanByIdHandler);
router.post("/", 
    isAuthorized({ hasRole: ["manager", "admin"] }),
    createLoanHandler
);

router.put("/:id", 
    isAuthorized({ hasRole: ["manager", "admin"] }),
    updateLoanHandler
);

router.delete("/:id", 
    isAuthorized({ hasRole: ["admin"] }),
    deleteLoanHandler
);

export default router;