/**
 * Immutable state store based on zustand v3 vanilla
 *
 * - Changed order of arguments to (get, set)
 * - Wrap setState() for immutable state
 */

// https://immerjs.github.io/immer/produce/
import produce, { Immutable } from 'immer'

export type State = object
// types inspired by setState from React, see:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/6c49e45842358ba59a508e13130791989911430d/types/react/v16/index.d.ts#L489-L495

export type PartialState<
  T extends State,
  K1 extends keyof T = keyof T,
  K2 extends keyof T = K1,
  K3 extends keyof T = K2,
  K4 extends keyof T = K3
> =
  | (Pick<T, K1> | Pick<T, K2> | Pick<T, K3> | Pick<T, K4> | T)
  | ((state: T) => Pick<T, K1> | Pick<T, K2> | Pick<T, K3> | Pick<T, K4> | T)
export type StateSelector<T extends State, U> = (state: T) => U
export type EqualityChecker<T> = (state: T, newState: T) => boolean
export type StateListener<T> = (state: T, previousState: T) => void
export type Subscribe<T extends State> = {
  (listener: StateListener<T>): () => void
  <StateSlice>(
    listener: StateListener<StateSlice>,
    selector?: StateSelector<T, StateSlice>,
    equalityFn?: EqualityChecker<StateSlice>
  ): () => void
}

export type SetState<T extends State> = {
  <
    K1 extends keyof T,
    K2 extends keyof T = K1,
    K3 extends keyof T = K2,
    K4 extends keyof T = K3
  >(
    partial: PartialState<T, K1, K2, K3, K4>,
    replace?: boolean
  ): void
}
export type GetState<T extends State> = () => T
export type Destroy = () => void
export type StoreApi<T extends State> = {
  setState: SetState<T>
  getState: GetState<T>
  subscribe: Subscribe<T>
  destroy: Destroy
}
export type StateCreator<
  T extends State,
  CustomSetState = SetState<T>,
  CustomGetState = GetState<T>,
  CustomStoreApi extends StoreApi<T> = StoreApi<T>
> = (get: CustomGetState, set: CustomSetState, api: CustomStoreApi) => T

export function shallowEqual<T, U>(objA: T, objB: U) {
  if (Object.is(objA, objB)) {
    return true
  }
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }
  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof U])
    ) {
      return false
    }
  }
  return true
}

function createStore<
  TState extends State,
  CustomSetState,
  CustomGetState,
  CustomStoreApi extends StoreApi<TState>
>(
  createState: StateCreator<
    TState,
    CustomSetState,
    CustomGetState,
    CustomStoreApi
  >
): CustomStoreApi

function createStore<TState extends State>(
  createState: StateCreator<TState, SetState<TState>, GetState<TState>, any>
): StoreApi<TState>

function createStore<
  TState extends State,
  CustomSetState,
  CustomGetState,
  CustomStoreApi extends StoreApi<Immutable<TState>>
>(
  createState: StateCreator<
    Immutable<TState>,
    CustomSetState,
    CustomGetState,
    CustomStoreApi
  >
): CustomStoreApi {
  let state: Immutable<TState>
  const listeners: Set<StateListener<Immutable<TState>>> = new Set()

  const setState: SetState<TState> = (partial, replace) => {
    const nextState = produce(
      partial instanceof Function
        ? partial
        : (draft) => Object.assign(draft, partial)
    )(state)

    if (nextState !== state) {
      const previousState = state
      state = replace
        ? (nextState as TState)
        : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  const getState: GetState<Immutable<TState>> = () => state

  const subscribeWithSelector = <StateSlice>(
    listener: StateListener<StateSlice>,
    selector: StateSelector<Immutable<TState>, StateSlice> = getState as any,
    equalityFn: EqualityChecker<StateSlice> = shallowEqual // Was Object.is
  ) => {
    let currentSlice: StateSlice = selector(state)
    function listenerToAdd() {
      const nextSlice = selector(state)
      if (!equalityFn(currentSlice, nextSlice)) {
        const previousSlice = currentSlice
        listener((currentSlice = nextSlice), previousSlice)
      }
    }
    listeners.add(listenerToAdd)
    // Unsubscribe
    return () => listeners.delete(listenerToAdd)
  }

  const subscribe: Subscribe<Immutable<TState>> = <StateSlice>(
    listener: StateListener<Immutable<TState>> | StateListener<StateSlice>,
    selector?: StateSelector<Immutable<TState>, StateSlice>,
    equalityFn?: EqualityChecker<StateSlice>
  ) => {
    if (selector || equalityFn) {
      return subscribeWithSelector(
        listener as StateListener<StateSlice>,
        selector,
        equalityFn
      )
    }
    listeners.add(listener as StateListener<Immutable<TState>>)
    // Unsubscribe
    return () => listeners.delete(listener as StateListener<Immutable<TState>>)
  }

  const destroy: Destroy = () => listeners.clear()
  const api = { setState, getState, subscribe, destroy }
  state = createState(
    getState as unknown as CustomGetState,
    setState as unknown as CustomSetState,
    api as unknown as CustomStoreApi
  )
  return api as unknown as CustomStoreApi
}

export { createStore }
