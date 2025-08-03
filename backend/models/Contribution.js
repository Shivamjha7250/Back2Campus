import mongoose from 'mongoose';
const ContributionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['feature', 'bug', 'idea', 'other'], default: 'idea' },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
const Contribution = mongoose.model('Contribution', ContributionSchema);
export default Contribution;