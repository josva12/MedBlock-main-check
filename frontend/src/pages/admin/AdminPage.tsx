import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchUsers, updateUser, fetchLogs, fetchSubscriptions } from "../../features/admin/adminSlice";

const AdminPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, logs, subscriptions, loading, error } = useSelector((state: RootState) => state.admin);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchLogs());
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const handleEdit = (userId: string, role: string, isActive: boolean) => {
    setEditUserId(userId);
    setEditRole(role);
    setEditActive(isActive);
  };

  const handleSave = async () => {
    if (editUserId) {
      await dispatch(updateUser({ id: editUserId, data: { role: editRole, isActive: editActive } }));
      setEditUserId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Admin Panel</h2>
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Name</th>
                <th className="px-2 py-1 text-left">Email</th>
                <th className="px-2 py-1 text-left">Role</th>
                <th className="px-2 py-1 text-left">Active</th>
                <th className="px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-2 py-1">{u.fullName}</td>
                  <td className="px-2 py-1">{u.email}</td>
                  <td className="px-2 py-1">
                    {editUserId === u._id ? (
                      <select value={editRole} onChange={e => setEditRole(e.target.value)} className="border rounded px-1 py-0.5">
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="pharmacy">Pharmacy</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {editUserId === u._id ? (
                      <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)} />
                    ) : (
                      u.isActive ? "Yes" : "No"
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {editUserId === u._id ? (
                      <>
                        <button className="text-green-600 mr-2" onClick={handleSave}>Save</button>
                        <button className="text-gray-600" onClick={() => setEditUserId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="text-blue-600" onClick={() => handleEdit(u._id, u.role, u.isActive)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Audit Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
          <div className="h-48 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1 text-left">Action</th>
                  <th className="px-2 py-1 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td className="px-2 py-1">{l.user}</td>
                    <td className="px-2 py-1">{l.action}</td>
                    <td className="px-2 py-1">{l.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Subscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
          <div className="h-48 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Plan</th>
                  <th className="px-2 py-1 text-left">Facility</th>
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(s => (
                  <tr key={s._id}>
                    <td className="px-2 py-1">{s.plan}</td>
                    <td className="px-2 py-1">{s.facility}</td>
                    <td className="px-2 py-1">{s.user}</td>
                    <td className="px-2 py-1">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <img src="https://images.unsplash.com/photo-1507679622673-989605832e3d?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow w-full max-w-xl mx-auto" />
    </div>
  );
};

export default AdminPage;
