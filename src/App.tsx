import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// routes
import Router from "./routes";
// theme
import ThemeProvider from "./theme";
// components
import ScrollToTop from "./components/scroll-to-top";
import { selectCurrentUser } from "./store/user/user.selector";
import useAuthSync from "./hooks/useAuthSync";
// ----------------------------------------------------------------------

export default function App() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  // Keep redux in lockstep with the Supabase session (login, logout,
  // expiry, other tabs). RequireAuth in routes.tsx reacts to the result.
  useAuthSync();

  // Signed-in users have no business on the guest pages; protected routes
  // are guarded at render time by RequireAuth in routes.tsx.
  useEffect(() => {
    const guestPages = ["/login", "/register", "/forgotpassword", "/404"];
    if (guestPages.includes(location.pathname) && currentUser?.email !== undefined) {
      navigate("/");
    }
  }, [location.pathname, currentUser?.email, navigate]);

  return (
    <ThemeProvider>
      <ToastContainer />
      <ScrollToTop />
      <Router />
    </ThemeProvider>
  );
}
