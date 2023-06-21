import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
// actions
import { setCurrentUserAction } from "./store/user/user.action";
// ----------------------------------------------------------------------

// export const CurrentUserMetadataContext = createContext({});

export default function App() {
  const dispatch = useDispatch();
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
      currentUser.email !== undefined
    ) {
      navigate("/dashboard/app");
    } else if (currentUser === undefined || currentUser?.email === undefined) {
      if (location.pathname === "/dashboard/app" || location.pathname === "/dashboard/profile-setting")
        navigate("/login");
      else navigate(location.pathname);
    }
  }, [location.pathname, currentUser?.email]);

  return (
    <ThemeProvider>
      {/* <CurrentUserMetadataContext.Provider
        value={{
          currentUserMetadata,
          setUserMetadata,
          ownedFilesMetadata,
          setOwnedFilesMetadata,
        }}
      > */}
      <ToastContainer />
      <ScrollToTop />
      <StyledChart />
      <Router />
      {/* </CurrentUserMetadataContext.Provider> */}
    </ThemeProvider>
  );
}
