import React from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">No user info found.</div>;

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pharmacy Profile</h1>
      <div className="space-y-4">
        <div><span className="font-semibold">Full Name:</span> {user.fullName}</div>
        <div><span className="font-semibold">Email:</span> {user.email}</div>
        <div><span className="font-semibold">Role:</span> {user.role}</div>
        <div><span className="font-semibold">Phone:</span> {user.phone}</div>
        <div><span className="font-semibold">Status:</span> {user.isActive ? 'Active' : 'Inactive'}</div>
      </div>
    </div>
  );
};

export default ProfilePage; 