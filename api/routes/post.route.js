import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import { addPost, deletePost, getAllPostDetails, getPost, getPosts, getSinglePostDetail, updatePost, verifyPost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/details", getAllPostDetails);
router.get("/details/:id", getSinglePostDetail);
router.get("/:id", getPost);
router.post("/", verifyToken, addPost);
router.delete("/:id", verifyToken, deletePost);
router.put("/:id", verifyToken, updatePost);
router.put("/verify/:id", verifyToken, verifyPost);

export default router;
