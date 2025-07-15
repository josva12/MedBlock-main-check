import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ textAlign: 'center', marginTop: '4rem' }}>
    <h2>404 - Page Not Found</h2>
    <p>
      <Link to="/">Go to Home</Link>
    </p>
  </div>
);

export default NotFoundPage; 