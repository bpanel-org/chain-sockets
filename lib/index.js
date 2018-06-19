// Entry point for your plugin
// This should expose your plugin's modules
/* START IMPORTS */
import { SOCKET_CONNECTED, NEW_BLOCK } from './constants';
import { watchChain, subscribeBlockConnect, setChainTip } from './actions';
/* END IMPORTS */

/* START EXPORTS */

export const metadata = {
  name: '@bpanel/chain-sockets',
  displayName: 'Chain Sockets',
  author: 'bcoin-org',
  description:
    'A simple utility plugin for bPanel to subscribe to chain events',
  version: require('../package.json').version
};

export const reduceChain = (state, action) => {
  const { type, payload } = action;
  const newState = { ...state };

  switch (type) {
    case 'SET_CHAIN_TIP': {
      return { ...newState, ...action.payload };
    }

    default:
      return state;
  }
}
// custom middleware for our plugin. This gets
// added to the list of middlewares in the app's store creator
// Use this to intercept and act on dispatched actions
// e.g. for responding to socket events
export const middleware = ({ dispatch, getState }) => next => action => {
  const { type, payload } = action;
  const chainState = getState().chain;

  if (type === SOCKET_CONNECTED) {
    // actions to dispatch when the socket has connected
    // these are broadcasts and subscriptions we want to make
    // to the bcoin node
    dispatch(watchChain());
    dispatch(subscribeBlockConnect());
  } else if (type === NEW_BLOCK && chainState.genesis) {
    dispatch(setChainTip(...payload));
  }
  return next(action);
};

// add new socket listeners
// push an object with event and actionType properties
// onto existing array of listeners
export const addSocketConstants = (sockets = { listeners: [] }) => {
  sockets.listeners.push({
    event: 'new block',
    actionType: NEW_BLOCK
  });
  return Object.assign(sockets, {
    socketListeners: sockets.listeners
  });
};

/* END EXPORTS */
