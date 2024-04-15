import mongoose from "mongoose";

const challengeSoundsSchema =  new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: { type: String, required: true, trim: true },
    challenge_room :{type:mongoose.Schema.Types.ObjectId, ref: 'ChallengeRoom'},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },    
})

const challengeSoundsModel = mongoose.model("challenge_sounds", challengeSoundsSchema)
export default challengeSoundsModel