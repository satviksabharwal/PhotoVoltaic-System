import { AnyAction } from 'redux';
import USER_ACTION_TYPES from './user.types';
import { CurrentUser } from '../../types/models';

export interface UserState {
  currentUser: CurrentUser | null;
}

const USER_INITIAL_STATE: UserState = {
  currentUser: null,
};

export const userReducer = (state: UserState = USER_INITIAL_STATE, action: AnyAction): UserState => {
  switch (action.type) {
    case USER_ACTION_TYPES.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload as CurrentUser | null };
    default:
      return state;
  }
};
