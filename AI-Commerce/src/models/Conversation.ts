import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
