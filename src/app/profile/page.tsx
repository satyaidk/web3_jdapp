"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { signOut as nextAuthSignOut } from 'next-auth/react';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, updateProfile, signOut } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    about: '',
    location: '',
    website: '',
    skills: ''
  });

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/login');
      return;
    }

    setFormData({
      fullName: currentUser.fullName,
      title: currentUser.title,
      about: currentUser.about,
      location: currentUser.location || '',
      website: currentUser.website || '',
      skills: currentUser.skills?.join(', ') || ''
    });
  }, [currentUser, isAuthenticated, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    
    updateProfile({
      fullName: formData.fullName,
      title: formData.title,
      about: formData.about,
      location: formData.location || undefined,
      website: formData.website || undefined,
      skills: skillsArray.length > 0 ? skillsArray : undefined
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName,
        title: currentUser.title,
        about: currentUser.about,
        location: currentUser.location || '',
        website: currentUser.website || '',
        skills: currentUser.skills?.join(', ') || ''
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignOut = async () => {
    try {
      // Sign out from NextAuth (for OAuth users)
      await nextAuthSignOut({ callbackUrl: '/' });
      
      // Sign out from our Zustand store
      signOut();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: just sign out from our store
      signOut();
      router.push('/');
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your account information and preferences
          </p>
        </div>
        
        <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-lg border border-white/10 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-indigo-600/20 backdrop-blur-md border border-indigo-400/30 hover:bg-indigo-600/30 hover:border-indigo-400/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 bg-red-600/20 backdrop-blur-md border border-red-400/30 hover:bg-red-600/30 hover:border-red-400/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600/20 backdrop-blur-md border border-green-400/30 hover:bg-green-600/30 hover:border-green-400/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-600/20 backdrop-blur-md border border-gray-400/30 hover:bg-gray-600/30 hover:border-gray-400/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="text-lg text-gray-900 dark:text-white">{currentUser.fullName}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="text-lg text-gray-900 dark:text-white">{currentUser.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="text-lg text-gray-900 dark:text-white">{currentUser.title}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="text-lg text-gray-900 dark:text-white">{currentUser.location || 'Not specified'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="text-lg text-gray-900 dark:text-white">
                      {currentUser.website ? (
                        <a href={currentUser.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                          {currentUser.website}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Since</label>
                  <div className="text-lg text-gray-900 dark:text-white">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</label>
                {isEditing ? (
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {currentUser.about || 'No description provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="React, JavaScript, Python (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentUser.skills && currentUser.skills.length > 0 ? (
                      currentUser.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">No skills specified</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
