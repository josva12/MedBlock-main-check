import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, textAlign: 'center' }}>
      <h2>Dashboard</h2>
      {user ? <p>Welcome, {user.name || user.fullName || user.email}!</p> : <p>Loading user data...</p>}
    </div>
  );
};

export default DashboardPage; 