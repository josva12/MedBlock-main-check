import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Eye, EyeOff, Clock, Wifi, WifiOff } from 'lucide-react';
import { apiClient } from '../../services/api';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>('profile');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showLastSeen, setShowLastSeen] = useState<boolean>(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setShowLastSeen(user.preferences?.showLastSeen ?? true);
      setShowOnlineStatus(user.preferences?.showOnlineStatus ?? true);
      setIsOnline(user.isOnline ?? false);
      if (user.profilePicture?.path) {
        setPreviewUrl(`http://localhost:5000/uploads/${user.profilePicture.filename}`);
      }
    }
  }, [user]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      await apiClient.put('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpdate();
      setProfilePicture(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySettingsUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.put('/users/privacy-settings', {
        showLastSeen,
        showOnlineStatus,
      });

      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineStatusUpdate = async (newStatus: boolean) => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.put('/users/online-status', {
        isOnline: newStatus,
      });

      setIsOnline(newStatus);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update online status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 ${activeTab === 'privacy' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            Privacy
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {profilePicture && (
                <button
                  onClick={handleProfilePictureUpload}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload Picture'}
                </button>
              )}
            </div>

            {/* Online Status */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-medium">Online Status</span>
                </div>
                <button
                  onClick={() => handleOnlineStatusUpdate(!isOnline)}
                  disabled={loading}
                  className={`px-4 py-2 rounded ${
                    isOnline
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  } disabled:opacity-50`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Last Seen Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Last Seen</div>
                  <div className="text-sm text-gray-500">Show when you were last online</div>
                </div>
              </div>
              <button
                onClick={() => setShowLastSeen(!showLastSeen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  showLastSeen ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showLastSeen ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Online Status Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Online Status</div>
                  <div className="text-sm text-gray-500">Show when you're online</div>
                </div>
              </div>
              <button
                onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  showOnlineStatus ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handlePrivacySettingsUpdate}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettingsModal; 