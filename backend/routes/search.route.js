import express from 'express';
import { searchUsers } from '../controllers/search.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/users/search", protectRoute, searchUsers);
router.get("/search/users", protectRoute, searchUsers);


export default router;