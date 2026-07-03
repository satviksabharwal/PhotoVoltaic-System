import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { setCurrentUserAction } from '../store/user/user.action';
import { selectCurrentUser } from '../store/user/user.selector';
import { RootState } from '../store/root-reducer';

export default function useAuthSync(): void {
  const dispatch = useDispatch();
  const store = useStore<RootState>();

  useEffect(() => {
    const sync = (session: Session | null) => {
      const current = selectCurrentUser(store.getState());

      if (!session) {
        if (current) dispatch(setCurrentUserAction(null));
        return;
      }

      const email = session.user.email ?? '';
      const displayName = (session.user.user_metadata?.display_name as string | undefined) ?? email;
      if (current?.email !== email || current?.displayName !== displayName) {
        dispatch(setCurrentUserAction({ displayName, email }));
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => sync(session));
    return () => listener.subscription.unsubscribe();
  }, [dispatch, store]);
}
