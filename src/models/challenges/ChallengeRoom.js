import mongoose from "mongoose";


const challengeRoomSchema = new mongoose.Schema({
    challenge_room_number: { type: String, required: true, trim: true },
    is_finished: { type: Boolean, default: false },
    is_expired: { type: Boolean, default: false },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    total_members: { type: Number, default: 0 },
    challenge_group: { type: mongoose.Schema.Types.ObjectId, ref: 'ChallengeGroup' },
    invitation: { type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' },
    challenge_sounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChallengeSounds' }],
    current_turn_holder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
})

const challengeRoomModel = mongoose.model("challenge_room", challengeRoomSchema)

export default challengeRoomModel