// File: backend/controllers/contributionController.js

import Contribution from '../models/Contribution.js';

// 1. Create a new contribution
export const createContribution = async (req, res) => {
    const { userId, title, description, category } = req.body;
    try {
        const newContribution = new Contribution({
            user: userId,
            title,
            description,
            category
        });

        // Save the new contribution to the database
        await newContribution.save();

        // Populate user details before sending the response
        const contribution = await Contribution.findById(newContribution._id)
            .populate('user', 'firstName lastName profile.avatar');

        res.status(201).json(contribution);
    } catch (error) {
        console.error("Create Contribution Error:", error);
        res.status(500).json({ message: 'Server error while creating contribution.' });
    }
};

// 2. Get all contributions
export const getContributions = async (req, res) => {
    try {
        // Find all contributions and populate the user details
        const contributions = await Contribution.find()
            .populate('user', 'firstName lastName profile.avatar')
            .sort({ upvotes: -1, createdAt: -1 }); // Sort by most upvoted, then newest

        res.status(200).json(contributions);
    } catch (error) {
        console.error("Fetch Contributions Error:", error);
        res.status(500).json({ message: 'Server error while fetching contributions.' });
    }
};

// 3. Upvote or remove an upvote from a contribution
export const upvoteContribution = async (req, res) => {
    const { userId } = req.body; // The user who is upvoting
    const { id: contributionId } = req.params; // The ID of the contribution being upvoted

    try {
        const contribution = await Contribution.findById(contributionId);

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found.' });
        }

        // Check if the user has already upvoted this contribution
        const upvotedIndex = contribution.upvotes.indexOf(userId);

        if (upvotedIndex > -1) {
            // User has already upvoted, so remove the upvote
            contribution.upvotes.splice(upvotedIndex, 1);
        } else {
            // User has not upvoted, so add the upvote
            contribution.upvotes.push(userId);
        }

        // Save the updated contribution
        await contribution.save();
        
        res.status(200).json(contribution);
    } catch (error) {
        console.error("Upvote Error:", error);
        res.status(500).json({ message: 'Server error while upvoting.' });
    }
};