import mongoose from "mongoose";


const challengeGroupSchema = new mongoose.Schema({
    
    name: { type: String, required: true, trim: true },
    has_finished: { type: Boolean, default: false },
    number_of_challenges: { type: Number, required: true },
    description: { type: String, required: false, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    sound : { type: mongoose.Schema.Types.ObjectId, ref: 'Sound' },
    created_by: { type: String, required: true, trim: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
})

const challengeGroupModel = mongoose.model("challenge_group", challengeGroupSchema)

export default challengeGroupModel