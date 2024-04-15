import mongoose from "mongoose";

const soundSchema = new mongoose.Schema({
    name: { type: String, required: false, trim: true },
    url: { type: String, required: true, trim: true },
    duration: {
        type: Number, required: true,
        validate: {
            validator: function (duration) {
                return duration > 0;
            },
            message: props => `Duration should be greater than 0`
        }
    },
    is_active: { type: Boolean, default: true },
    size: { type: Number, default: 0 },
    mimetype: { type: String, default: 'audio/mpeg' },
    originalname: { type: String, default: 'file' },
    pack_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SoundPack' },


});

const Sound = mongoose.model("Sound", soundSchema);

export default Sound;
