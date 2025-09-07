import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get fully populated post data
const getPopulatedPost = (id) => {
    return Post.findById(id)
        .populate('user', 'firstName lastName profile.avatar')
        .populate('comments.user', 'firstName lastName profile.avatar')
        .populate('comments.replies.user', 'firstName lastName profile.avatar');
};

// 1. Create a new post
export const createPost = async (req, res) => {
    const { content, location } = req.body;
    const files = req.files || [];

    try {
        const formattedFiles = files.map(file => {
            let fileType = 'document';
            if (file.mimetype.startsWith('image/')) fileType = 'image';
            else if (file.mimetype.startsWith('video/')) fileType = 'video';
            return { url: `/uploads/${file.filename}`, fileType: fileType };
        });

        const newPost = new Post({
            user: req.user.id,
            content,
            files: formattedFiles,
            location,
        });

        const savedPost = await newPost.save();
        const populatedPost = await getPopulatedPost(savedPost._id);

        req.io.emit('new_post', populatedPost);
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ message: 'Server error while creating post.', error: error.message });
    }
};

// 2. Get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar')
            .populate('comments.replies.user', 'firstName lastName profile.avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getAllPosts:", error);
        res.status(500).json({ message: 'Server error while fetching posts.' });
    }
};

// 3. Get posts for a specific user
export const getMyPosts = async (req, res) => {
    try {
        
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'firstName lastName profile.avatar') 
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// 4. Edit a post
export const editPost = async (req, res) => {
    const { content, location } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });
        if (post.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized.' });

        post.content = content ?? post.content;
        post.location = location ?? post.location;

        await post.save();
        const populatedPost = await getPopulatedPost(post._id);

        req.io.emit('update_post', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error while editing post.' });
    }
};

// 5. Delete a post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });
        if (post.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized.' });

        if (post.files && post.files.length > 0) {
            post.files.forEach(file => {
                const filePath = path.join(__dirname, '..', file.url);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Failed to delete file: ${filePath}`, err);
                    });
                }
            });
        }

        await post.deleteOne();

        req.io.emit('delete_post', { postId: req.params.id });
        res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting post.' });
    }
};

// 6. Like/Unlike a post
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user.id;
        const isLiked = post.likes.includes(userId);

        if (isLiked) post.likes.pull(userId);
        else post.likes.push(userId);

        await post.save();

        //  Notification logic for like
        if (!isLiked && post.user.toString() !== userId) {
            const notification = new Notification({
                recipient: post.user,
                sender: userId,
                type: 'like',
                post: post._id,
            });
            await notification.save();
            req.io.emit(`notification_${post.user.toString()}`, notification);
        }

        const populatedPost = await getPopulatedPost(post._id);
        req.io.emit('update_post', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error while liking post.' });
    }
};

// 7. Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.comments.push({ user: req.user.id, text: req.body.text });

        await post.save();

        //  Notification logic for comment
        if (post.user.toString() !== req.user.id) {
            const notification = new Notification({
                recipient: post.user,
                sender: req.user.id,
                type: 'comment',
                post: post._id,
            });
            await notification.save();
            req.io.emit(`notification_${post.user.toString()}`, notification);
        }

        const populatedPost = await getPopulatedPost(req.params.id);
        req.io.emit('update_post', populatedPost);
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding comment.' });
    }
};

// 8. Like a comment
export const likeComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user.id;
        const post = await Post.findById(postId);
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found.' });

        const isLiked = comment.likes.includes(userId);
        if (isLiked) comment.likes.pull(userId);
        else comment.likes.push(userId);

        await post.save();
        const populatedPost = await getPopulatedPost(postId);

        req.io.emit('update_post', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// 9. Reply to a comment
export const replyToComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { text } = req.body;
        const post = await Post.findById(postId);
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found.' });

        comment.replies.push({ user: req.user.id, text });

        await post.save();
        const populatedPost = await getPopulatedPost(postId);

        req.io.emit('update_post', populatedPost);
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// 10. Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found.' });

        if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this comment.' });
        }

        comment.deleteOne();
        await post.save();
        const populatedPost = await getPopulatedPost(postId);
        req.io.emit('update_post', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// 11. Delete a reply
export const deleteReply = async (req, res) => {
    try {
        const { postId, commentId, replyId } = req.params;
        const post = await Post.findById(postId);
        const comment = post.comments.id(commentId);
        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found.' });

        if (reply.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this reply.' });
        }

        reply.deleteOne();
        await post.save();
        const populatedPost = await getPopulatedPost(postId);
        req.io.emit('update_post', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// 12. Like a reply
export const likeReply = async (req, res) => {
    try {
        const { postId, commentId, replyId } = req.params;
        const userId = req.user.id;
        const post = await Post.findById(postId);
        const comment = post.comments.id(commentId);
        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found.' });

        const isLiked = reply.likes.includes(userId);
        if (isLiked) {
            reply.likes.pull(userId);
        } else {
            reply.likes.push(userId);
        }
        await post.save();
        const populatedPost = await getPopulatedPost(postId);
        req.io.emit('update_post', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error while liking reply.' });
    }
};
