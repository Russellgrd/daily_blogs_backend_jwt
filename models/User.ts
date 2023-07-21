import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
    }
})

export default mongoose.model("User", UserSchema);