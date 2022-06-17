
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
