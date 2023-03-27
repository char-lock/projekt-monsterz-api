import { Request, Response, Router } from "express";
import AuthHandler from "./auth.handler";

const router = Router();

router.post("/login", AuthHandler.IssueNewAuthToken);
router.get("/refresh", AuthHandler.RefreshAuth);

export default router;
