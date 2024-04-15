import express from 'express';
const router = express.Router();
import UserController from '../controllers/auth/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';


/* ======== Protected Routes ======== */
router.use('/changepassword', checkUserAuth)
router.use('/loggeduser', checkUserAuth)

/* ======== Public Routes ======== */
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)
router.post('/verify-reset-otp', UserController.userPasswordResetOTPVerify)
router.post('/verify-email', UserController.verifyUserEmail)

/* ======== Protected Routes ======== */
router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser', UserController.loggedUser)
router.get(
    "/profile",
    UserController.getProfile,
)

export default router