import mongoose from "mongoose";

const invitationRecipentsSchema = new mongoose.Schema({
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invitation_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' },
    is_expired : { type: Boolean, default: false },
    expires_at: { type: Date, default: Date.now, expires: '24h' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
})

const invitationRecipentsModel = mongoose.model("invitation_recipents", invitationRecipentsSchema)
export default invitationRecipentsModel