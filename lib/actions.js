import { ChainEntry as BChainEntry} from 'bcoin';
import { chain as chainUtils } from '@bpanel/bpanel-utils';
import { ChainEntry as HChainEntry } from 'hsd';

export function watchChain() {
  return {
    type: 'EMIT_SOCKET',
    bsock: {
      type: 'broadcast',
      message: 'watch chain'
    }
  };
}

export function subscribeBlockConnect() {
  return {
    type: 'EMIT_SOCKET',
    bsock: {
      type: 'subscribe',
      message: 'block connect',
      responseEvent: 'new block'
    }
  };
}

export function setChainTip(entry) {
  return (dispatch, getState) => {
    const { currentClient } = getState().clients;
    let blockMeta;
    if (currentClient.chain === 'handshake')
      blockMeta = HChainEntry.fromRaw(entry);
    else
      blockMeta = BChainEntry;

    const { calcProgress } = chainUtils;
    const { time, hash, height } = blockMeta;
    const genesis = getState().chain.genesis.time;
    const prevProgress = getState().chain.progress;
    const progress = calcProgress(genesis, time);
    const chain = { tip: hash, progress, height };
    if (progress > 0.8 || progress - prevProgress > 0.0000001) {
      // only update the chain tip if
      // progress is noticeably different
      // should resolve some frontend performance issues
      return dispatch({
        type: 'SET_CHAIN_TIP',
        payload: chain
      });
    }
  };
}
