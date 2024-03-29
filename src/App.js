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
import { StyledChart } from "./components/chart";
import { selectCurrentUser } from "./store/user/user.selector";
// ----------------------------------------------------------------------

export default function App() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  useEffect(() => {
    if (
      (location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/tac" ||
        location.pathname === "/forgotpassword" ||
        location.pathname === "/404") &&
      currentUser?.email !== undefined
    ) {
      navigate("/dashboard/app");
    } else if (currentUser === undefined || currentUser?.email === undefined) {
      if (
        (location.pathname === "/login" && currentUser?.email === undefined) ||
        (location.pathname === "/register" && currentUser?.email === undefined) ||
        (location.pathname === "/tac" && currentUser?.email === undefined) ||
        (location.pathname === "/forgotpassword" && currentUser?.email === undefined) ||
        (location.pathname === "/404" && currentUser?.email === undefined)
      ) {
        navigate(location.pathname);
      } else navigate("/login");
    }
  }, [location.pathname, currentUser?.email]);

  return (
    <ThemeProvider>
      <ToastContainer />
      <ScrollToTop />
      <StyledChart />
      <Router />
    </ThemeProvider>
  );
}
