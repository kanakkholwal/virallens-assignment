import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexed by userId and createdAt
chatSchema.index({ userId: 1, createdAt: 1 });


export default mongoose?.models?.Chat || mongoose.model('Chat', chatSchema)
