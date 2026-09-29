import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return <div className="container" style={{ padding: 60 }}><div className="spinner" /></div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
