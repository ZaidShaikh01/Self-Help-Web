import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getPreferences,
  updatePreferences,
  changeCurrentName,
  logoutAll,
  getSessions,
  revokeSession,
} from '../controllers/user.controller.js';
import {
  registerLimiter,
  loginLimiter,
  refreshLimiter,
} from '../middlewares/rateLimit.middleware.js';
import { validateObjectIdParam } from '../middlewares/validateObjectId.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.param('id', validateObjectIdParam);

// secured Routes
router.route('/register').post(registerLimiter, registerUser);
router.route('/login').post(loginLimiter, loginUser);
router.route('/refresh-token').post(refreshLimiter, refreshAccessToken);

router.route('/logout-all').post(verifyJWT, logoutAll);
router.route('/sessions').get(verifyJWT, getSessions);
router.route('/sessions/:id').delete(verifyJWT, revokeSession);

// Secured Routes (Requires JWT authentication)
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router
  .route('/preferences')
  .get(verifyJWT, getPreferences)
  .patch(verifyJWT, updatePreferences);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/update-account').patch(verifyJWT, changeCurrentName);

export default router;
