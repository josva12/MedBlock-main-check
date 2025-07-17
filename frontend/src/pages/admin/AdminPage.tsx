import React from "react";

const AdminPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Admin Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-gray-700 dark:text-gray-200">View, edit, and assign roles to users.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
          <p className="text-gray-700 dark:text-gray-200">View system activity and security logs.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
          <p className="text-gray-700 dark:text-gray-200">Manage facility and user subscriptions.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Role Assignment</h3>
          <p className="text-gray-700 dark:text-gray-200">Assign and manage user roles and permissions.</p>
        </div>
      </div>
      <img src="https://images.unsplash.com/photo-1507679622673-989605832e3d?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow w-full max-w-xl mx-auto" />
    </div>
  );
};

export default AdminPage;
