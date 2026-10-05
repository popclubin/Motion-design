import { createBrowserRouter } from 'react-router';
import AdminPage from '../pages/AdminPage';
import EditorPage from '../pages/EditorPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import { RequireAdmin } from '../features/auth/RequireAdmin';
import { RequireAuth } from '../features/auth/RequireAuth';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/editor',
    element: (
      <RequireAuth>
        <EditorPage />
      </RequireAuth>
    ),
  },
  {
    path: '/editor/:slug',
    element: (
      <RequireAuth>
        <EditorPage />
      </RequireAuth>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminPage />
      </RequireAdmin>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]);
