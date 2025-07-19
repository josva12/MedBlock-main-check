import React, { useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateUserProfile, changePassword } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  User,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type TabType = 'profile' | 'security' | 'appearance';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    department: user?.department || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Form states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileMessage(null);

    try {
      await dispatch(updateUserProfile(profileForm)).unwrap();
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    setIsPasswordChanging(true);
    setPasswordMessage(null);

    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your personal information and professional details.
        </p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Specialization
            </label>
            <input
              type="text"
              value={profileForm.specialization}
              onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Department
            </label>
            <input
              type="text"
              value={profileForm.department}
              onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {profileMessage && (
          <div className={`p-4 rounded-md ${
            profileMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {profileMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {profileMessage.text}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProfileSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProfileSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="block w-full pr-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="block w-full pr-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="block w-full pr-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {passwordMessage && (
          <div className={`p-4 rounded-md ${
            passwordMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {passwordMessage.text}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPasswordChanging}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPasswordChanging ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize the appearance of your MedBlock interface.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ThemeToggle />
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Theme</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You are currently using the <span className="font-medium capitalize">{theme}</span> theme.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'appearance':
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 