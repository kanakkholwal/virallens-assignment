import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            default: 'New Chat',
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose?.models?.Conversation || mongoose.model('Conversation', conversationSchema);
