import { Navigate, useRoutes } from "react-router-dom";
// layouts
import DashboardLayout from "./layouts/dashboard";
import SimpleLayout from "./layouts/simple";
import SolarSenseLayout from "./layouts/solarsense/SolarSenseLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Page404 from "./pages/Page404";
import DashboardAppPage from "./pages/DashboardAppPage";
import ProfileSetting from "./pages/ProfileSetting";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProjectPage from "./pages/ProjectPage";
import ProductPage from "./pages/ProductPage";
import ProductVisualization from "./pages/ProductVisualization";

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: "app", element: <DashboardAppPage /> },
        { path: "profile-setting", element: <ProfileSetting /> },
      ],
    },
    // Redesigned SolarSense pages — top-bar shell, no sidebar. Same URLs as before.
    {
      path: "/dashboard",
      element: <SolarSenseLayout />,
      children: [
        { path: "projects", element: <ProjectPage /> },
        { path: "projects/:projectId", element: <ProductPage /> },
        { path: "projects/:projectId/:productId", element: <ProductVisualization /> },
      ],
    },
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
    {
      path: "forgotpassword",
      element: <ForgotPassword />,
    },
    {
      path: "reset-password",
      element: <ResetPassword />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: "404", element: <Page404 /> },
        { path: "*", element: <Navigate to="/404" /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
