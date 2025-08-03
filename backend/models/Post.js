// File: backend/models/Post.js
import mongoose from 'mongoose';

// Reply Schema (Comment ke andar nested)
const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

// Comment Schema
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [replySchema], // ✅ Replies yahan save honge
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        content: { type: String, trim: true },
        files: [{
            url: { type: String, required: true },
            fileType: { type: String, enum: ['image', 'video', 'document'], required: true },
        }],
        location: { type: String, trim: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [commentSchema], // ✅ Updated comment schema
    },
    { timestamps: true }
);

postSchema.pre('validate', function (next) {
    if (!this.content && (!this.files || this.files.length === 0)) {
        next(new Error('Post must have either content or at least one file.'));
    } else {
        next();
    }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
