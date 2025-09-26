import Contribution from '../models/Contribution.js';
import User from '../models/User.js';
import path from 'path';

export const createContribution = async (req, res) => {
    const { userId, title, description, category } = req.body;

    try {
        let fileUrl = null;
        let fileType = null;

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
            const ext = path.extname(req.file.filename).toLowerCase();

            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                fileType = 'image';
            } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
                fileType = 'video';
            } else if (ext === '.pdf') {
                fileType = 'pdf';
            } else {
                fileType = 'other';
            }
        }

        const newContribution = new Contribution({
            user: userId,
            title,
            description,
            category,
            fileUrl,
            fileType,
        });

        await newContribution.save();

        const contribution = await Contribution.findById(newContribution._id)
            .populate('user', 'firstName lastName profile.avatar');

        res.status(201).json(contribution);
    } catch (error) {
        console.error(' Create Contribution Error:', error);
        res.status(500).json({ message: 'Server error while creating contribution.' });
    }
};

export const getContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find()
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(contributions);
    } catch (error) {
        console.error(' Fetch Contributions Error:', error);
        res.status(500).json({ message: 'Server error while fetching contributions.' });
    }
};

export const getLikersForContribution = async (req, res) => {
    const { id: contributionId } = req.params;

    try {
        const contribution = await Contribution.findById(contributionId).select('upvotes');

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        const likers = await User.find({
            _id: { $in: contribution.upvotes }
        }).select('firstName lastName profile.avatar email');

        res.status(200).json(likers);
    } catch (error) {
        console.error(' Fetch Likers Error:', error);
        res.status(500).json({ message: 'Server error while fetching likers.' });
    }
};

export const upvoteContribution = async (req, res) => {
    const { userId } = req.body;
    const { id: contributionId } = req.params;

    try {
        const contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        const index = contribution.upvotes.indexOf(userId);
        if (index > -1) {
            contribution.upvotes.splice(index, 1);
        } else {
            contribution.upvotes.push(userId);
        }

        await contribution.save();

        const updatedContribution = await Contribution.findById(contributionId)
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar');

        res.status(200).json(updatedContribution);
    } catch (error) {
        console.error(' Upvote Error:', error);
        res.status(500).json({ message: 'Server error while upvoting.' });
    }
};

export const deleteContribution = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const contribution = await Contribution.findById(id);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        if (contribution.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this contribution.' });
        }

        await Contribution.findByIdAndDelete(id);

        res.status(200).json({ message: 'Contribution deleted successfully.' });
    } catch (error) {
        console.error(' Delete Error:', error);
        res.status(500).json({ message: 'Server error while deleting contribution.' });
    }
};

export const addCommentToContribution = async (req, res) => {
    const { id } = req.params;
    const { userId, text } = req.body;

    try {
        const contribution = await Contribution.findById(id);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        const comment = {
            user: userId,
            text,
            createdAt: new Date(),
            replies: [],
        };

        contribution.comments.push(comment);
        await contribution.save();

        const updatedContribution = await Contribution.findById(id)
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar');

        res.status(200).json(updatedContribution);
    } catch (error) {
        console.error(' Comment Error:', error);
        res.status(500).json({ message: 'Server error while adding comment.' });
    }
};

export const addReplyToComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId, text } = req.body;

    try {
        const contribution = await Contribution.findById(postId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        const comment = contribution.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const newReply = {
            user: userId,
            text,
            createdAt: new Date(),
        };

        if (!comment.replies) {
            comment.replies = [];
        }

        comment.replies.push(newReply);

        await contribution.save();

        const updatedContribution = await Contribution.findById(postId)
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar')
            .populate('comments.replies.user', 'firstName lastName profile.avatar');

        res.status(200).json(updatedContribution);
    } catch (error) {
        console.error(' Reply Error:', error);
        res.status(500).json({ message: 'Server error while adding reply.' });
    }
};

export const getRecentContributions = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const recentContributions = await Contribution.find({
            createdAt: { $gte: twentyFourHoursAgo }
        })
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(recentContributions);
    } catch (error) {
        console.error(' Fetch Recent Contributions Error:', error);
        res.status(500).json({ message: 'Server error while fetching recent contributions.' });
    }
};

export const deleteCommentFromContribution = async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    try {
        const contribution = await Contribution.findById(postId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        const comment = contribution.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const isPostAuthor = contribution.user.toString() === userId;
        const isCommentAuthor = comment.user.toString() === userId;

        if (!isPostAuthor && !isCommentAuthor) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment.' });
        }

        contribution.comments.pull({ _id: commentId });
        await contribution.save();

        const updatedContribution = await Contribution.findById(postId)
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar')
            .populate('comments.replies.user', 'firstName lastName profile.avatar');

        res.status(200).json(updatedContribution);

    } catch (error) {
        console.error(' Delete Comment Error:', error);
        res.status(500).json({ message: 'Server error while deleting comment.' });
    }
};

export const deleteReplyFromComment = async (req, res) => {
    const { postId, commentId, replyId } = req.params;
    const { userId } = req.body;

    try {
        const contribution = await Contribution.findById(postId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        const comment = contribution.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found.' });
        }

        const isPostAuthor = contribution.user.toString() === userId;
        const isCommentAuthor = comment.user.toString() === userId;
        const isReplyAuthor = reply.user.toString() === userId;

        if (!isPostAuthor && !isCommentAuthor && !isReplyAuthor) {
            return res.status(403).json({ message: 'Unauthorized to delete this reply.' });
        }

        comment.replies.pull({ _id: replyId });

        await contribution.save();

        const updatedContribution = await Contribution.findById(postId)
            .populate('user', 'firstName lastName profile.avatar')
            .populate('comments.user', 'firstName lastName profile.avatar')
            .populate('comments.replies.user', 'firstName lastName profile.avatar');

        res.status(200).json(updatedContribution);

    } catch (error) {
        console.error(' Delete Reply Error:', error);
        res.status(500).json({ message: 'Server error while deleting reply.' });
    }
};