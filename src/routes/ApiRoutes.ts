import express from "express";
import home from "../controllers/Home";
const router = express.Router();

router.get("/", home);

export default router;
