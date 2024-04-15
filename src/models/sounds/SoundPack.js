import mongoose from "mongoose";

const soundPackSchema = new mongoose.Schema({
    name: { type: String, required: false, trim: true },
    url: { type: String, required: true, trim: true },
    is_paid: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    price: { type: Number, default: 0, validate: { validator: function (price) { return price >= 0; }, message: props => `Price should be greater than or equal to 0` } },
    discounted_price: { type: Number, default: 0, validate: { validator: function (discount) { return discount >= 0; }, message: props => `Discount should be greater than or equal to 0` } },
    sounds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sound'
        }],
        validate: {
            validator: function (sounds) {
                return sounds.length >= 0 && sounds.length <= 10;
            },
            message: props => `A package can have at least 1 and at most 10 sounds!`
        },
        default: []
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

});

const SoundPack = mongoose.model("sound_pack", soundPackSchema);

export default SoundPack;
