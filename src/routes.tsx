import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import SolarSenseLayout from './layouts/solarsense/SolarSenseLayout';
import { selectCurrentUser } from './store/user/user.selector';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Page404 from './pages/Page404';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProjectPage from './pages/ProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import InsightsPage from './pages/InsightsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';

function RequireAuth({ children }: { children: ReactElement }) {
  const currentUser = useSelector(selectCurrentUser);
  if (!currentUser?.email) return <Navigate to="/login" replace />;
  return children;
}

export default function Router() {
  const routes = useRoutes([
    // Signed-in app: Projects is the home page.
    {
      path: '/',
      element: (
        <RequireAuth>
          <SolarSenseLayout />
        </RequireAuth>
      ),
      children: [
        { element: <ProjectPage />, index: true },
        { path: 'projects/:projectId', element: <ProjectDetailPage /> },
        { path: 'projects/:projectId/:productId', element: <InsightsPage /> },
        { path: 'account-settings', element: <AccountSettingsPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'register',
      element: <RegisterPage />,
    },
    {
      path: 'forgotpassword',
      element: <ForgotPassword />,
    },
    {
      path: 'reset-password',
      element: <ResetPassword />,
    },
    // Legacy URLs from the sidebar era.
    {
      path: 'dashboard/*',
      element: <Navigate to="/" replace />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
