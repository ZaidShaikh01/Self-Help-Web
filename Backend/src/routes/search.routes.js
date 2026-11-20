import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { globalSearchQuerySchema } from '../validators/search.validator.js';
import { globalSearch } from '../controllers/search.controller.js';

const router = Router();

router.use(verifyJWT);
router.get('/', validate(globalSearchQuerySchema, 'query'), globalSearch);

export default router;
