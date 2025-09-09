import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Camera, Video, FileText, MapPin, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';

const CreatePostPage = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [location, setLocation] = useState(''); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && files.length === 0) {
            setError('Please write something or upload a file.');
            return;
        }
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('content', content);
        formData.append('location', location); 
        files.forEach(file => formData.append('files', file));

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/posts/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Server error while creating post.');
            console.error("Post creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold p-4 border-b">Create Post</h2>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex items-start gap-4">
                    <img src={user.profile?.avatar ? `${API_BASE_URL}${user.profile.avatar}` : 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=A'} alt="user" className="w-10 h-10 rounded-full" />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user.firstName}?`}
                        className="w-full text-lg border-none focus:ring-0 resize-none"
                        rows="4"
                    />
                </div>

            
                {files.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {files.map((file, index) => {
                            const previewUrl = URL.createObjectURL(file);
                            const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
                            return (
                                <div key={index} className="relative group">
                                    {fileType === 'image' && <img src={previewUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" />}
                                    {fileType === 'video' && <video src={previewUrl} controls className="w-full h-32 object-cover rounded-lg" />}
                                    {fileType === 'document' && (
                                        <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2">
                                            <FileText size={40} className="text-gray-500" />
                                            <span className="text-xs text-center break-all">{file.name}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

            
                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin size={20} />
                        <span className="font-semibold">Add Location</span>
                    </div>
                    <input
                        type="text"
                        placeholder="e.g., Mumbai, Maharashtra"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                
                <div className="p-4 border-t mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600"><Camera size={22} className="text-green-500" /> Photo</button>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600"><Video size={22} className="text-red-500" /> Video</button>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600"><FileText size={22} className="text-purple-500" /> Document</button>
                    </div>
                    <button type="submit" disabled={loading || (!content && files.length === 0)} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default CreatePostPage;
