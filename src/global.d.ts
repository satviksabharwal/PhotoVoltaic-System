import { compose } from 'redux';

declare global {
  interface Window {
    // Redux DevTools extension compose enhancer (used in store/store.ts)
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

export {};
