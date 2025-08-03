// File: frontend/src/pages/ContributePage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ThumbsUp, Lightbulb, CheckCircle } from 'lucide-react';
import API_BASE_URL from './apiConfig';

const ContributePage = () => {
    const { user: currentUser } = useOutletContext();
    const [contributions, setContributions] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('idea');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch all contributions when the component mounts
    const fetchContributions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/contributions`);
            if (!response.ok) throw new Error('Failed to fetch contributions.');
            const data = await response.json();
            setContributions(data);
        } catch (error) {
            console.error(error);
            setError('Could not load contributions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContributions();
    }, []);

    // Handle form submission to create a new contribution
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/contributions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser._id, title, description, category }),
            });
            const newContribution = await response.json();
            if (!response.ok) throw new Error(newContribution.message || 'Failed to submit.');

            // Add the new contribution to the top of the list
            setContributions([newContribution, ...contributions]);
            setTitle('');
            setDescription('');
            setCategory('idea');
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle upvoting a contribution
    const handleUpvote = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/contributions/${id}/upvote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser._id }),
            });
            const updatedContribution = await response.json();
            if (!response.ok) throw new Error('Failed to upvote.');

            // Update the specific contribution in the list
            setContributions(contributions.map(c => c._id === id ? updatedContribution : c));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Form to submit a new idea */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm sticky top-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Lightbulb className="text-yellow-500" />
                        Share Your Idea
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="e.g., Add a mentorship feature"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="Describe your idea in detail..."
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="idea">Idea</option>
                                <option value="feature">New Feature</option>
                                <option value="bug">Bug Report</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {submitting ? 'Submitting...' : 'Submit Idea'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right side: List of all contributions */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Community Suggestions</h2>
                    {loading ? (
                        <p>Loading suggestions...</p>
                    ) : (
                        <div className="space-y-4">
                            {contributions.map(item => (
                                <div key={item._id} className="border p-4 rounded-lg flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <button onClick={() => handleUpvote(item._id)} className="p-2 rounded-full hover:bg-gray-100">
                                            <ThumbsUp className={`${item.upvotes.includes(currentUser._id) ? 'text-blue-600 fill-current' : 'text-gray-500'}`} size={20} />
                                        </button>
                                        <span className="font-bold text-sm">{item.upvotes.length}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <img src={`${API_BASE_URL}${item.user.profile.avatar}`} alt="user" className="h-6 w-6 rounded-full" />
                                            <span className="text-sm font-semibold">{item.user.firstName} {item.user.lastName}</span>
                                        </div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContributePage;