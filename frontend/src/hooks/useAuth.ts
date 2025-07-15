import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken } from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  return { user, token };
}; 