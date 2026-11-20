import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getPinnedItems } from '../controllers/pinned.controller.js';

const router = Router();

router.use(verifyJWT);
router.get('/', getPinnedItems);

export default router;
