import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    type: { type: String, required: false, trim: true },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'invitation_recipents'
    }],
    challenge_room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "challenge_room",

    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    is_expired: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const invitationModel = mongoose.model("invitation", invitationSchema);
export default invitationModel;
