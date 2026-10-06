import { createBrowserRouter } from 'react-router';
import AdminPage from '../pages/AdminPage';
import EditorPage from '../pages/EditorPage';
import HubPage from '../pages/HubPage';
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
    path: '/hub',
    element: (
      <RequireAuth>
        <HubPage />
      </RequireAuth>
    ),
  },
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
