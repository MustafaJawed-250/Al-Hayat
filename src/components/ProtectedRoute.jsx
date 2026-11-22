import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '../utils/api';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setOk(res.data?.isAdmin === true))
      .catch(() => setOk(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!ok) return <Navigate to="/admin/login" replace />;
  return children;
}
