import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
// firebase methods
import {
  createUserDocumentFromAuth,
  onAuthStateChangedListener,
  getSingleDocument,
} from './utils/firebase/firebase.utils';
import { selectCurrentUser } from './store/user/user.selector';
// actions
import { setCurrentUserAction } from './store/user/user.action';
// ----------------------------------------------------------------------

// export const CurrentUserMetadataContext = createContext({});

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  // const [currentUserMetadata, setUserMetadata] = useState({
  //   userEmail: '',
  //   userFirebaseId: '',
  //   userId: '',
  //   userRole: 'normal',
  //   userStorageUsed: 0,
  //   userVersion: 'free',
  // });
  // const [ownedFilesMetadata, setOwnedFilesMetadata] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      let displayName;
      if (user) {
        await createUserDocumentFromAuth(user);
        const userDoc = await getSingleDocument('users', user && user.uid);
        displayName = userDoc && userDoc.displayName;
      }

      dispatch(setCurrentUserAction({ ...user, displayName }));
    });
    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    if (
      (location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/tac' ||
        location.pathname === '/forgotpassword' ||
        location.pathname === '/404') &&
      currentUser.displayName !== undefined
    ) {
      navigate('/dashboard/app');
    } else if (currentUser?.displayName === undefined) {
      if (location.pathname === '/dashboard/app') navigate('/login');
      else navigate(location.pathname);
    }
  }, [location.pathname, currentUser?.displayName]);

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
