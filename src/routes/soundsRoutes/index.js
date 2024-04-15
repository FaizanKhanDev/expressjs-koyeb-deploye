import express from 'express';
const router = express.Router();
import SoundsController from '../../controllers/soundsController/index.js';

/* =========== Sounds Routes =========== */
router.post('/uploadSounds', SoundsController.uploadNewSounds)
router.get('/getListOfSounds', SoundsController.getListOfSounds)
router.get('/getSoundsById/:id', SoundsController.getSoundById);
router.post('/deleteSoundById/:id', SoundsController.deleteSoundById);


export default router
