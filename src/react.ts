import { useEffect, useReducer } from 'react'
import { createStore, State } from './index'
import type { StateCreator, StateSelector, StoreApi } from './index'

const hasWindow = typeof window !== 'undefined'

export function createStoreHook<
  TState extends State,
  CustomStoreApi extends StoreApi<TState> = StoreApi<TState>
>(
  storeOrCreator: StateCreator<object, unknown, unknown, any> | object
): (selector?: StateSelector<TState, unknown>) => TState {
  let store: CustomStoreApi
  function ensureStore() {
    store =
      storeOrCreator instanceof Function
        ? createStore(storeOrCreator)
        : storeOrCreator
  }
  ensureStore()
  const reducer = (c: number) => c + 1
  return function useStore(selector?: StateSelector<TState, unknown>): TState {
    /**
     * For client-side, re-use same store.
     * For server-side, create new store on every call.
     * @see https://github.com/vercel/next.js/blob/main/examples/with-zustand/lib/store.js
     */
    if (!hasWindow) ensureStore()

    const [, forceUpdate] = useReducer(reducer, 0)

    useEffect(() => {
      return store.subscribe(function () {
        forceUpdate()
      }, selector)
    }, [])

    return store.getState()
  }
}
