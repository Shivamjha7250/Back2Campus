import React, { useState, useRef } from 'react';
import { Camera, Video, FileText, MapPin, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../pages/apiConfig'; 

const CreatePostModal = ({ user, onClose, onPostSuccess }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [location, setLocation] = useState({ interview: '', office: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) {
                return { url: URL.createObjectURL(file), type: 'image' };
            }
            if (file.type.startsWith('video/')) {
                return { url: URL.createObjectURL(file), type: 'video' };
            }
            return { name: file.name, type: 'document' };
        });
        setFilePreviews(prev => [...prev, ...newPreviews]);
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
        
       
        const locationString = [location.interview, location.office].filter(Boolean).join(', ');
        formData.append('location', locationString);

        files.forEach(file => {
            
            formData.append('files', file); 
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/posts/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            onPostSuccess(response.data); 
            onClose(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post.');
            console.error("Post creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Create Post</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4">
                    <div className="flex items-start gap-4">
                        
                        <img src={user.profile?.avatar || 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=A'} alt="user" className="w-10 h-10 rounded-full" />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`What's on your mind, ${user.firstName}?`}
                            className="w-full text-lg border-none focus:ring-0 resize-none"
                            rows="4"
                        />
                    </div>
                    
                     {filePreviews.length > 0 && (
                       <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                             {filePreviews.map((preview, index) => (
                             <div key={index} className="relative">
                         {preview.type === 'image' && <img src={preview.url} alt="preview" className="w-full h-32 object-cover rounded-lg" />}
                             {preview.type === 'video' && <video src={preview.url} controls className="w-full h-32 object-cover rounded-lg" />}
                                 {preview.type === 'document' && (
                                 <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2">
                                 <FileText size={40} className="text-gray-500" />
                                 <span className="text-xs text-center break-all">{preview.name}</span>
                             </div>
                                 )}
                                 </div>
                                         ))}
                                         </div>
                                                 )}
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                    />
                </form>

                <div className="p-4 border-t">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                                <Camera size={22} className="text-green-500" /> Photo
                            </button>
                            <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                                <Video size={22} className="text-red-500" /> Video
                            </button>
                            <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                                <FileText size={22} className="text-purple-500" /> Document
                            </button>
                        </div>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || (!content && files.length === 0)}
                            className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;