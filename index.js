import create from './create'

/**
 * Create store
 */
export function createStore(creator) {
  const hasWindow = typeof window !== 'undefined'
  let _useStore

  const createUseStore = () => {
    _useStore = create(creator)
    // Methods for outside components: getState, setState, subscribe, destroy
    Object.assign(useStore, _useStore)
  }

  function useStore(selector) {
    /**
     * For client-side, re-use same store.
     * For server-side, create new store on every call.
     * @see https://github.com/vercel/next.js/blob/main/examples/with-zustand/lib/store.js
     */
    if (!_useStore || !hasWindow) createUseStore()

    return _useStore(
      selector instanceof Function ? selector : createSelector(selector)
    )
  }

  createUseStore()

  return useStore
}

/**
 * Create selector from list of property names
 */
export function createSelector(...args) {
  const properties = {}

  for (const arg of args) {
    if (typeof arg === 'string') {
      properties[arg] = true
    } else if (Array.isArray(arg)) {
      for (const key of arg) {
        properties[key] = true
      }
    }
  }

  if (!Object.keys(properties).length) {
    return (state) => state
  }

  return (state) =>
    Object.keys(state).reduce((obj, key) => {
      if (properties[key] || state[key] instanceof Function) {
        obj[key] = state[key]
      }
      return obj
    }, {})
}

/**
 * Create child store
 */
export function createChildStore(key, get, set, create) {
  return {
    [key]: create(
      () => get()[key],
      (state) =>
        set((draft) => {
          if (state instanceof Function) {
            state(draft[key])
          } else {
            Object.assign(draft[key], state)
          }
        }),
      get,
      set
    ),
  }
}
