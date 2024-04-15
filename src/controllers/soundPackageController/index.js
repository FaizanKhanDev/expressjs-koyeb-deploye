import SoundPack from "../../models/sounds/SoundPack.js";
import mongoose from "mongoose";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import SoundsModel from "../../models/sounds/sounds.js";


const isValidObjectId = mongoose.isValidObjectId;

class SoundsPackageController {
    static uploadNewSoundPack = async (req, res) => {
        try {
            const { name, price, is_active, is_paid } = req.body
            if (!name || !price || !is_active || !is_paid) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            const file = req.files.sound_pack;
            let fileUrl = '';

            /* =========== Check if server is running in localhost or live domain =========== */
            if (req.hostname === 'localhost' || req.hostname === '8000') {
                fileUrl = `http://localhost:${process.env.PORT}/uploads/sound_pack/${file[0].filename}`;
            }
            else {
                fileUrl = `https://yourdomain.com/uploads/sound_pack/${file[0].filename}`;
            }

            let payload = {
                url: fileUrl,
                name: name,
                price: price,
                is_active: is_active,
                is_paid: is_paid
            }
            const soundPack = new SoundPack(payload);
            await soundPack.save();
            res.status(200).json({
                message: 'Sound Package created successfully',
                data: soundPack
            });
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }


    }
    static getListOfSoundPacks = async (req, res) => {
        try {
            const soundPacks = await SoundPack.find().populate('sounds');
            res.status(200).json({
                data: soundPacks
            });
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static getSoundPackById = async (req, res) => {
        try {
            if (!isValidObjectId(req.params.id)) {
                return res.status(400).json({ message: 'Invalid Sound Pack ID' });
            }
            const soundPack = await SoundPack.findById(req.params.id).populate('sounds');

            if (!soundPack) {
                return res.status(404).json({ message: 'Sound Package not found' });
            }
            res.status(200).json({
                data: soundPack
            });
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static updateSoundPackById = async (req, res) => {
        try {
            const { name, price, is_active, discounted_price, is_paid } = req.body;
            if (!name || !price || !is_active || !discounted_price || !is_paid) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            const file = req.files.sound_pack;
            let fileUrl = '';

            if (req.hostname === 'localhost' || req.hostname === '8000') {
                fileUrl = `http://localhost:${process.env.PORT}/uploads/sound_pack/${file[0].filename}`;
            } else {
                fileUrl = `https://yourdomain.com/uploads/sound_pack/${file[0].filename}`;
            }

            let payload = {
                url: fileUrl,
                name: name,
                price: price,
                is_active: is_active,
                discounted_price: discounted_price,
                is_paid: is_paid,
                updated_at: Date.now()
            };

            if (!req.params.id) {
                return res.status(400).json({ message: 'Sound Package ID is required' });
            }
            let findSoundPack = await SoundPack.findById(req.params.id);
            if (!findSoundPack) {
                return res.status(404).json({ message: 'Sound Package not found' });
            } else {
                if (findSoundPack.url) {
                    const { name, ext } = path.parse(findSoundPack.url);
                    const fileName = `${name}${ext}`;
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'sound_pack', fileName);

                    console.log("filePath", filePath);

                    fs.access(filePath, fs.constants.F_OK, (err) => {
                        if (err) {
                            return res.status(404).json({ message: 'File not found' });
                        }

                        fs.unlink(filePath, (err) => {
                            if (err) {
                                return res.status(500).json({ message: 'Failed to delete file' });
                            }
                            // File deleted successfully
                            return res.status(200).json({ message: 'Sound Package updated successfully', data: soundPack });
                        });
                    });
                } else {
                    // If soundPack doesn't have a URL, just return success message
                    return res.status(200).json({ message: 'Sound Package updated successfully', data: soundPack });
                }
            }

            const soundPack = await SoundPack.findByIdAndUpdate(req.params.id, payload, { new: true });
            if (!soundPack) {
                return res.status(404).json({ message: 'Sound Package not found' });
            }

        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    };


    static deleteSoundPack = async (req, res) => {
        try {
            if (!req.params.id) {
                return res.status(400).json({ message: 'Sound Package ID is required' });
            }
            const findSoundPack = await SoundPack.findById(req.params.id).populate('sounds');
            if (!findSoundPack) {
                return res.status(404).json({ message: 'Sound Package not found' });
            } else {
                if (findSoundPack.url) {
                    const { name, ext } = path.parse(findSoundPack.url);
                    const fileName = `${name}${ext}`;
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'sound_pack', fileName);
                    fs.access(filePath, fs.constants.F_OK, (err) => {
                        if (err) {
                            return res.status(404).json({ message: 'File not found' });
                        }

                        fs.unlink(filePath, (err) => {
                            if (err) {
                                return res.status(500).json({ message: 'Failed to delete file' });
                            }
                            // File deleted successfully
                            return res.status(200).json({ message: 'Sound Package updated successfully', data: soundPack });
                        });
                    });
                }

                const deletedSounds = [];
                for (const soundId of soundPack.sounds) {
                    const sound = await SoundsModel.findById(soundId);
                    if (!sound) {
                        continue; // Skip if sound not found
                    }

                    // Remove the file associated with the sound
                    const { name, ext } = path.parse(findSoundPack.url);
                    const fileName = `${name}${ext}`;
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'sound_pack', fileName);


                    fs.access(filePath, fs.constants.F_OK, async (err) => {
                        if (!err) {
                            // File exists, delete it
                            fs.unlink(soundFilePath, async (err) => {
                                if (err) {
                                    console.error('Failed to delete sound file:', err);
                                } else {
                                    console.log('Sound file deleted successfully');
                                }
                            });
                        }
                    });

                    // Delete the sound document
                    const deletedSound = await SoundsModel.findByIdAndDelete(soundId);
                    deletedSounds.push(deletedSound);
                }



                const soundPack = await SoundPack.findByIdAndDelete(req.params.id);
                res.status(200).json({
                    message: 'Sound Package deleted successfully',
                    data: soundPack
                });
            }

        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }

    }
}


export default SoundsPackageController