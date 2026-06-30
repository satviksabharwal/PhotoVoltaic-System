import { RootState } from '../root-reducer';

export const selectCurrentUser = (state: RootState) => state.user.currentUser;
