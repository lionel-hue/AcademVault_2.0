"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';
import MainLayout from '@/app/components/Layout/MainLayout';
import { MobileButton, MobileCard, useIsMobile } from '@/app/components/UI/MobileOptimized';

export default function ProfilePage() {
  const router = useRouter();
  const { alert, confirm, prompt } = useModal();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [stats, setStats] = useState(null);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    institution: '',
    department: '',
    phone: '',
    profile_image: null
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadActivityHistory();
    } else if (activeTab === 'preferences') {
      loadPreferences();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setStats(response.data.stats);
        setFormData({
          name: response.data.name || '',
          bio: response.data.bio || '',
          institution: response.data.institution || '',
          department: response.data.department || '',
          phone: response.data.phone || '',
          profile_image: null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      await alert({
        title: 'Error',
        message: 'Failed to load profile',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityHistory = async () => {
    try {
      const response = await AuthService.getActivityHistory({ limit: 20 });
      if (response.success) {
        setActivities(response.data || []);
      }
    } catch (error) {
      console.error('Error loading activity history:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await AuthService.getPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image: file }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setUploadingImage(true);
      const response = await AuthService.updateProfile(formData);
      if (response.success) {
        await alert({
          title: 'Success',
          message: 'Profile updated successfully',
          variant: 'success'
        });
        setEditMode(false);
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to update profile',
        variant: 'danger'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setChangingPassword(true);
      const response = await AuthService.changePassword(passwordData);
      if (response.success) {
        await alert({
          title: 'Success',
          message: 'Password changed successfully',
          variant: 'success'
        });
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to change password',
        variant: 'danger'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      const response = await AuthService.updatePreferences(preferences);
      if (response.success) {
        await alert({
          title: 'Success',
          message: 'Preferences updated successfully',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      await alert({
        title: 'Error',
        message: error.message || 'Failed to update preferences',
        variant: 'danger'
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete Account',
      cancelText: 'Cancel'
    });
    
    if (!confirmed) return;
    
    const confirmationText = await prompt({
      title: 'Confirm Deletion',
      message: 'Please type "DELETE MY ACCOUNT" to confirm',
      placeholder: 'DELETE MY ACCOUNT',
      variant: 'danger'
    });
    
    if (confirmationText === 'DELETE MY ACCOUNT') {
      try {
        const response = await AuthService.deleteAccount(confirmationText);
        if (response.success) {
          await alert({
            title: 'Account Deleted',
            message: 'Your account has been deleted successfully',
            variant: 'success'
          });
          router.push('/login');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        await alert({
          title: 'Error',
          message: error.message || 'Failed to delete account',
          variant: 'danger'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProfileImageUrl = () => {
    if (formData.profile_image instanceof File) {
      return URL.createObjectURL(formData.profile_image);
    }
    
    if (profile?.profile_image) {
      if (profile.profile_image.startsWith('http://') || 
          profile.profile_image.startsWith('https://')) {
        return profile.profile_image;
      }
      
      if (profile.profile_image.startsWith('storage/')) {
        return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${profile.profile_image}`;
      }
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=3b82f6&color=fff&size=${isMobile ? '80' : '128'}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'activity', label: 'Activity', icon: 'fas fa-history' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6">
        {/* Header - Mobile Optimized */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400 text-xs md:text-sm lg:text-base">
            Manage your account information and preferences
          </p>
        </div>

        {/* Tabs - Mobile Optimized with Horizontal Scroll */}
        <div className="flex overflow-x-auto pb-2 mb-4 md:mb-8 -mx-3 sm:-mx-4 px-3 sm:px-4">
          <div className="flex gap-1 md:gap-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 min-h-[44px] ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <i className={`${tab.icon} ${isMobile ? 'text-sm' : 'text-base'}`}></i>
                <span className="text-xs md:text-sm lg:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Mobile Optimized Grid */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Left Column - Main Content */}
          <div className="w-full lg:w-2/3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4 md:space-y-6">
                {/* Profile Info Card */}
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                    {/* Profile Image - Mobile Optimized */}
                    <div className="relative mx-auto sm:mx-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-gray-800">
                        <img 
                          src={getProfileImageUrl()} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {editMode && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 md:p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                          <i className="fas fa-camera text-xs md:text-sm"></i>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      {editMode ? (
                        <div className="space-y-3 md:space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Bio
                            </label>
                            <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base resize-none"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2">
                            {profile?.name}
                          </h2>
                          <p className="text-gray-400 text-sm md:text-base mb-2 break-all">
                            {profile?.email}
                          </p>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs md:text-sm">
                            <i className="fas fa-graduation-cap"></i>
                            <span className="capitalize">{profile?.type}</span>
                          </div>
                          {profile?.bio && (
                            <p className="text-gray-300 text-sm md:text-base mt-4">
                              {profile.bio}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </MobileCard>

                {/* Academic Information Card */}
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Institution
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                          placeholder="Your institution"
                        />
                      ) : (
                        <p className="text-white text-sm md:text-base">
                          {profile?.institution || 'Not specified'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Department
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                          placeholder="Your department"
                        />
                      ) : (
                        <p className="text-white text-sm md:text-base">
                          {profile?.department || 'Not specified'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                          placeholder="Your phone number"
                        />
                      ) : (
                        <p className="text-white text-sm md:text-base">
                          {profile?.phone || 'Not specified'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Type
                      </label>
                      <p className="text-white text-sm md:text-base capitalize">
                        {profile?.type}
                      </p>
                    </div>
                  </div>
                </MobileCard>

                {/* Account Statistics Card */}
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <div className="text-center p-3 md:p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                        {stats?.documents || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Documents</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                        {stats?.collections || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Collections</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                        {stats?.friends || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Friends</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                        {stats?.storage_used || '0 MB'}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Storage</div>
                    </div>
                  </div>
                </MobileCard>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {editMode ? (
                    <>
                      <MobileButton
                        onClick={handleSaveProfile}
                        disabled={uploadingImage}
                        variant="primary"
                        className="flex-1"
                      >
                        {uploadingImage ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            Save Changes
                          </>
                        )}
                      </MobileButton>
                      <MobileButton
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            name: profile?.name || '',
                            bio: profile?.bio || '',
                            institution: profile?.institution || '',
                            department: profile?.department || '',
                            phone: profile?.phone || '',
                            profile_image: null
                          });
                        }}
                        variant="secondary"
                        className="flex-1"
                      >
                        Cancel
                      </MobileButton>
                    </>
                  ) : (
                    <MobileButton
                      onClick={() => setEditMode(true)}
                      variant="primary"
                      className="w-full sm:w-auto"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Profile
                    </MobileButton>
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <div
                          key={`activity-${activity.id || index}`}
                          className="flex items-start gap-3 p-3 bg-gray-800/20 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <i className={`${activity.icon || 'fas fa-history'} text-blue-400`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm md:text-base truncate">
                              {activity.description}
                            </p>
                            <p className="text-gray-500 text-xs md:text-sm mt-1">
                              {formatDate(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-history text-gray-600 text-3xl mb-3"></i>
                        <p className="text-gray-500 text-sm md:text-base">
                          No recent activity
                        </p>
                      </div>
                    )}
                  </div>
                </MobileCard>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && preferences && (
              <div className="space-y-4">
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['light', 'dark', 'auto'].map(theme => (
                          <label key={theme} className="cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value={theme}
                              checked={preferences.theme === theme}
                              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                              className="sr-only"
                            />
                            <div className={`p-3 rounded-lg text-center capitalize text-sm md:text-base ${
                              preferences.theme === theme 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}>
                              {theme}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </MobileCard>

                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(preferences.notification_settings || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm md:text-base capitalize truncate">
                            {key.replace('_', ' ')}
                          </p>
                          <p className="text-gray-400 text-xs md:text-sm truncate">
                            Receive notifications for {key.replace('_', ' ')}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              notification_settings: {
                                ...prev.notification_settings,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </MobileCard>

                <MobileButton
                  onClick={handleUpdatePreferences}
                  variant="primary"
                  className="w-full"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save Preferences
                </MobileButton>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Change Password Card */}
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="new_password_confirmation"
                        value={passwordData.new_password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <MobileButton
                      onClick={handleChangePassword}
                      disabled={
                        changingPassword || 
                        !passwordData.current_password || 
                        !passwordData.new_password || 
                        passwordData.new_password !== passwordData.new_password_confirmation
                      }
                      variant="primary"
                      className="w-full"
                    >
                      {changingPassword ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key mr-2"></i>
                          Change Password
                        </>
                      )}
                    </MobileButton>
                  </div>
                </MobileCard>

                {/* Danger Zone Card */}
                <MobileCard className="p-3 md:p-4 lg:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                    Danger Zone
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <h4 className="font-bold text-white mb-2 text-sm md:text-base">
                        Delete Account
                      </h4>
                      <p className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently deleted.
                      </p>
                      <MobileButton
                        onClick={handleDeleteAccount}
                        variant="danger"
                        className="w-full"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Delete Account
                      </MobileButton>
                    </div>
                  </div>
                </MobileCard>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar (Hidden on mobile, shown on large screens) */}
          <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
            <div className="space-y-4 md:space-y-6">
              {/* Account Info Card */}
              <MobileCard className="p-3 md:p-4 lg:p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm md:text-base">Email</span>
                    <span className="text-white text-sm md:text-base truncate ml-2">
                      {profile?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm md:text-base">Account Type</span>
                    <span className="text-white text-sm md:text-base capitalize">
                      {profile?.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm md:text-base">Member Since</span>
                    <span className="text-white text-sm md:text-base">
                      {profile?.registration_date 
                        ? new Date(profile.registration_date).toLocaleDateString() 
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm md:text-base">Email Verified</span>
                    <span className={`text-sm md:text-base ${
                      profile?.email_verified_at ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {profile?.email_verified_at ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </MobileCard>

              {/* Quick Stats Card */}
              <MobileCard className="p-3 md:p-4 lg:p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-400">Storage Used</span>
                      <span className="text-white">{stats?.storage_used || '0 MB'}</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" 
                        style={{ width: '45%' }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-bold text-white">
                        {stats?.documents || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-bold text-white">
                        {stats?.categories || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-bold text-white">
                        {stats?.collections || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Collections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-bold text-white">
                        {stats?.friends || 0}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">Friends</div>
                    </div>
                  </div>
                </div>
              </MobileCard>

              {/* Quick Actions Card */}
              <MobileCard className="p-3 md:p-4 lg:p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full flex items-center gap-3 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors min-h-[44px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-home text-blue-400"></i>
                    </div>
                    <span className="text-white text-sm md:text-base">Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => router.push('/documents')}
                    className="w-full flex items-center gap-3 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors min-h-[44px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-file-alt text-green-400"></i>
                    </div>
                    <span className="text-white text-sm md:text-base">My Documents</span>
                  </button>
                  <button
                    onClick={() => router.push('/collections')}
                    className="w-full flex items-center gap-3 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors min-h-[44px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-layer-group text-purple-400"></i>
                    </div>
                    <span className="text-white text-sm md:text-base">My Collections</span>
                  </button>
                </div>
              </MobileCard>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}