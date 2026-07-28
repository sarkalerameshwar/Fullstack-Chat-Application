import mongoose, { Types } from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required : true,
        },
        recieverId:{
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text:{
            type: String,
        },
        image:{
            type : String,
        },
        readAt: {
            type: Date,
            default: null,
        }
    },
    {timestamps: true},
)

messageSchema.index({ recieverId: 1, senderId: 1, readAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
