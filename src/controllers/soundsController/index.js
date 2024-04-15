import SoundsModel from "../../models/sounds/sounds.js";
import SoundPack from "../../models/sounds/SoundPack.js";

class SoundsController {
    static uploadNewSounds = async (req, res) => {
        try {
            const { name, duration, is_active, pack_id } = req.body
            if (!req.files || !req.files.sounds) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            if (!name ||!duration || !is_active || !pack_id) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const file = req.files.sounds;
            let fileUrl = '';
            let payload = {
                originalname: req.files.sounds[0].originalname,
                mimetype: req.files.sounds[0].mimetype,
                size: req.files.sounds[0].size,
                name: name,
                duration: duration,
                pack_id: pack_id
            }

            /* =========== Check if server is running in localhost or live domain =========== */
            if (req.hostname === 'localhost' || req.hostname === '8000') {
                fileUrl = `http://localhost:${process.env.PORT}/uploads/sounds/${file[0].filename}`;
            }
            else {
                fileUrl = `https://yourdomain.com/uploads/sounds/${file[0].filename}`;
            }

            /* ================= Check if SoundPack has exceed the maximum number of sounds ================== */
            const soundPack = await SoundPack.findById(pack_id);
            if (soundPack.sounds.length >= 10) {
                return res.status(400).json({ message: 'SoundPack has exceed the maximum number of sounds' });
            }

            // Save the file URL to your database
            const sound = new SoundsModel({
                url: fileUrl,
                ...payload,
            }
            );
            sound.save();

            /* ================== Save Sound ID to SoundPack Model =============== */
            soundPack.sounds.push(sound._id);
            soundPack.save();

            // Return the URL to the client
            res.json({
                message: 'File uploaded successfully',
                data: sound

            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static getListOfSounds = async (req, res) => {
        try {
            const sounds = await SoundsModel.find();
            res.json({
                message: 'Sounds fetched successfully',
                data: sounds
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static getSoundById = async (req, res) => {
        console.log(req.params);
        try {
            const { id } = req.params
            console.log(id);
            const sound = await SoundsModel.findById(id)
            res.json({
                message: 'Sound fetched successfully',
                data: sound
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static deleteSoundById = async (req, res) => {
        try {
            const { id } = req.params;

            // Find the sound by ID
            const sound = await SoundsModel.findById(id);
            if (!sound) {
                return res.status(404).json({ message: 'Sound not found' });
            }

            // If the sound has subSounds, delete them first
            if (sound.subSounds.length > 0) {
                // Delete all subSounds
                await SoundsModel.deleteMany({ _id: { $in: sound.subSounds } });
            }

            // Delete the sound itself
            const deletedSound = await SoundsModel.findByIdAndDelete(id);

            res.json({
                message: 'Sound deleted successfully',
                data: deletedSound
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


}


export default SoundsController