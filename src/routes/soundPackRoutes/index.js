import express from 'express';
const router = express.Router();
import SoundsPackageController from '../../controllers/soundPackageController/index.js';


/* =========== Sound Package Routes =========== */
router.post('/uploadSoundPackage', SoundsPackageController.uploadNewSoundPack)
router.get('/getListOfSoundPackages', SoundsPackageController.getListOfSoundPacks)
router.get('/getSoundPackageById/:id', SoundsPackageController.getSoundPackById);
router.post('/updateSoundPackById/:id', SoundsPackageController.updateSoundPackById);
// router.post('/deleteSoundPackById/:id', SoundsPackageController.deleteSoundPackById);
export default router
