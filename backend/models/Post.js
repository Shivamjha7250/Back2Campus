import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});


const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [replySchema], 
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        content: { type: String, trim: true },
        files: [{
    url: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'video', 'document'], required: true },
    public_id: { type: String, required: true } 

        }],
        location: { type: String, trim: true },
        
        likes: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }],

        comments: [commentSchema],
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