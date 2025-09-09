import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, BookOpen, Plus, Trash2, HelpCircle, Shield, KeyRound, Briefcase } from 'lucide-react';
import ProfilePhotoManager from '../components/ProfilePhotoManager';
import axios from 'axios';
import API_BASE_URL from './apiConfig';

const SettingsPage = () => {
    const { user: currentUser } = useOutletContext();
    const [activeTab, setActiveTab] = useState('profile');

    
    const [profileData, setProfileData] = useState({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        userType: currentUser.userType || 'Student',
    });

    
    const [education, setEducation] = useState(currentUser.profile?.education || [{ institution: '', degree: '', field: '' }]);
    
    const [internship, setInternship] = useState(currentUser.profile?.internship || { company: '', role: '', duration: '' });
    const [currentJob, setCurrentJob] = useState(currentUser.profile?.currentJob || { company: '', role: '' });
    const [previousJob, setPreviousJob] = useState(currentUser.profile?.previousJob || { company: '', role: '' });

    
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: currentUser.privacy?.profileVisibility || 'Everyone',
        connectionRequests: currentUser.privacy?.connectionRequests || 'Everyone',
    });

    
    const handleAddEducation = () => setEducation([...education, { institution: '', degree: '', field: '' }]);
    const handleRemoveEducation = (index) => setEducation(education.filter((_, i) => i !== index));
    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...education];
        updatedEducation[index][field] = value;
        setEducation(updatedEducation);
    };
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handlePrivacyChange = (e) => setPrivacySettings({ ...privacySettings, [e.target.name]: e.target.value });
    
    
    const handleExperienceChange = (setter, field, value) => {
        setter(prevState => ({ ...prevState, [field]: value }));
    };


    const handleSaveChanges = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const payload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                userType: profileData.userType,
                education: education,
                internship: internship,
                currentJob: currentJob,
                previousJob: previousJob,
            };

            const response = await axios.put(`${API_BASE_URL}/api/users/profile`, payload, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.status === 200) {
                alert("Changes Saved Successfully!");
                window.location.reload(); 
            } else {
                alert("Failed to save changes.");
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            alert("An error occurred while saving changes.");
        }
    };

    const handleSavePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New password and confirm password do not match!");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/api/users/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.status === 200) {
                alert("Password updated successfully!");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert("Failed to update password.");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            alert(error.response?.data?.message || "An error occurred.");
        }
    };

    const handleSavePrivacy = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/api/users/privacy`, privacySettings, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (response.status === 200) {
                alert("Privacy settings updated successfully!");
            } else {
                alert("Failed to update privacy settings.");
            }
        } catch (error) {
            console.error("Error updating privacy settings:", error);
            alert("An error occurred while updating privacy settings.");
        }
    };

    const menuItems = [
        { id: 'profile', name: 'Profile Settings', icon: User },
        { id: 'education', name: 'Education & Career', icon: BookOpen },
        { id: 'account', name: 'Account Settings', icon: KeyRound },
        { id: 'privacy', name: 'Privacy', icon: Shield },
        { id: 'help', name: 'Help', icon: HelpCircle },
    ];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4">
                    <nav className="space-y-2">
                        {menuItems.map(item => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${activeTab === item.id ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-gray-100'}`}>
                                <item.icon size={20} /> {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="w-full md:w-3/4 border-t md:border-t-0 md:border-l pl-0 md:pl-6 pt-6 md:pt-0">
                    {activeTab === 'profile' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Profile Settings</h3>
                            <div className="mb-6">
                                <ProfilePhotoManager user={currentUser} onPhotoUpdate={() => window.location.reload()} />
                            </div>
                            <div className="space-y-4">
                                <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} placeholder="First Name" className="w-full p-2 border rounded-md" />
                                <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} placeholder="Last Name" className="w-full p-2 border rounded-md" />
                                <select name="userType" value={profileData.userType} onChange={handleProfileChange} className="w-full p-2 border rounded-md bg-white">
                                    <option value="Student">Student</option>
                                    <option value="Alumni">Alumni</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><BookOpen size={24}/> Education</h3>
                            <div className="space-y-4">
                                {education.map((edu, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-md border relative">
                                        <input type="text" placeholder="College/University" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className="w-full p-2 border rounded-md mb-2" />
                                        <input type="text" placeholder="Degree (e.g., B.Tech)" value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} className="w-full p-2 border rounded-md mb-2" />
                                        <input type="text" placeholder="Field of Study (e.g., Computer Science)" value={edu.field} onChange={(e) => handleEducationChange(index, 'field', e.target.value)} className="w-full p-2 border rounded-md" />
                                        {education.length > 1 && <button onClick={() => handleRemoveEducation(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddEducation} className="flex items-center gap-2 text-blue-600 mt-4 font-semibold"><Plus size={18} /> Add More Education</button>
                            
                            <h3 className="text-xl font-semibold my-4 pt-4 border-t flex items-center gap-2"><Briefcase size={24}/> Career</h3>
                            
                            
                            <div className="font-semibold mb-2">Internship</div>
                            <div className="bg-gray-50 p-4 rounded-md border space-y-2">
                                <input type="text" placeholder="Company Name" value={internship.company} onChange={(e) => handleExperienceChange(setInternship, 'company', e.target.value)} className="w-full p-2 border rounded-md" />
                                <input type="text" placeholder="Your Role (e.g., SDE Intern)" value={internship.role} onChange={(e) => handleExperienceChange(setInternship, 'role', e.target.value)} className="w-full p-2 border rounded-md" />
                                <input type="text" placeholder="Duration (e.g., 6 Months)" value={internship.duration} onChange={(e) => handleExperienceChange(setInternship, 'duration', e.target.value)} className="w-full p-2 border rounded-md" />
                            </div>

                            
                            <div className="font-semibold mt-4 mb-2">Current Job</div>
                            <div className="bg-gray-50 p-4 rounded-md border space-y-2">
                                <input type="text" placeholder="Company Name" value={currentJob.company} onChange={(e) => handleExperienceChange(setCurrentJob, 'company', e.target.value)} className="w-full p-2 border rounded-md" />
                                <input type="text" placeholder="Your Role (e.g., Software Engineer)" value={currentJob.role} onChange={(e) => handleExperienceChange(setCurrentJob, 'role', e.target.value)} className="w-full p-2 border rounded-md" />
                            </div>

                            
                            <div className="font-semibold mt-4 mb-2">Previous Job</div>
                             <div className="bg-gray-50 p-4 rounded-md border space-y-2">
                                <input type="text" placeholder="Company Name" value={previousJob.company} onChange={(e) => handleExperienceChange(setPreviousJob, 'company', e.target.value)} className="w-full p-2 border rounded-md" />
                                <input type="text" placeholder="Your Role" value={previousJob.role} onChange={(e) => handleExperienceChange(setPreviousJob, 'role', e.target.value)} className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'account' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
                            <div className="space-y-4">
                                <input type="password" name="currentPassword" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded-md" />
                                <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded-md" />
                                <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded-md" />
                            </div>
                            <button onClick={handleSavePassword} className="mt-4 px-8 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Update Password</button>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Privacy Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <label>Who can see your profile?</label>
                                    <select name="profileVisibility" value={privacySettings.profileVisibility} onChange={handlePrivacyChange} className="p-1 border rounded-md bg-white">
                                        <option value="Everyone">Everyone</option>
                                        <option value="Connections">Connections</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <label>Who can send you connection requests?</label>
                                    <select name="connectionRequests" value={privacySettings.connectionRequests} onChange={handlePrivacyChange} className="p-1 border rounded-md bg-white">
                                        <option value="Everyone">Everyone</option>
                                        <option value="No one">No one</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleSavePrivacy} className="mt-8 px-8 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Save Changes</button>
                        </div>
                    )}
                    
                    {activeTab === 'help' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Help & Support</h3>
                            <p className="text-gray-600 mb-4">For any support, please email us 24/7. We are here to help you.Write promblems with screenshort.</p>
                            <a href="mailto:back2tocampus@gmail.com" className="inline-block px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Contact Support</a>
                        </div>
                    )}

                    {(activeTab === 'profile' || activeTab === 'education') && (
                        <button onClick={handleSaveChanges} className="mt-8 px-8 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">Save Changes</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;