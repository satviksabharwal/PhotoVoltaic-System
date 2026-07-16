import { useEffect, useRef } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { setCurrentUserAction } from '../store/user/user.action';
import { selectCurrentUser } from '../store/user/user.selector';
import { RootState } from '../store/root-reducer';

export default function useAuthSync(): void {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const queryClient = useQueryClient();
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const sync = (session: Session | null) => {
      const userId = session?.user?.id ?? null;
      if (lastUserIdRef.current !== undefined && lastUserIdRef.current !== userId) {
        queryClient.clear();
      }
      lastUserIdRef.current = userId;

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
  }, [dispatch, store, queryClient]);
}
