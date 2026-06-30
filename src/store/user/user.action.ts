import USER_ACTION_TYPES from './user.types';
import { createAction } from '../../utils/reducer/reducer.utils';
import { CurrentUser } from '../../types/models';

export const setCurrentUserAction = (user: CurrentUser | null) =>
  createAction(USER_ACTION_TYPES.SET_CURRENT_USER, user);

export type UserAction = ReturnType<typeof setCurrentUserAction>;
