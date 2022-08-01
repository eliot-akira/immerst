# Immerst

Modular immutable state management with React Hooks support


## Design

The library provides a pattern for managing state.

#### Store = State + Actions

A **store** is an object with state and actions.

The **state** is a set of properties that describe the current state of the application, or its individual feature areas.

The **actions** are functions that change the state. They're often asynchronous, and perform some logic like fetching data from an API, showing the current progress.

As a rule, it's best to  actions are the only way to change state - but . This makes it simpler to manage all state changes in the same place, instead of across the application.

#### Immutable

What "immutable" means is that every time the state is changed, it creates a new state. This is in contrast to the usual way, which is to *mutate* the same state object and its properties over time.

The advantage of immutable state, provided internally by [`immer`](https://immerjs.github.io/immer/), is that it becomes fast and efficient to know when the state, or a partial slice of state, has changed. Integrated with React Hooks, this enables atomic updates of the user interface.


## Usage

### Create store

Use `createStore` to create a general-purpose store.

```js
import { createStore } from 'immerst'

export const store = createStore((get, set, context) => ({
  count: 0,
  increment() {
    const { count } = get()
    set({
      count: count + 1
    })
  },
}))
```

It accepts a function called the store creator. The creator defines the state properties, and actions that change the state.


### Create store hook

Use `createStoreHook` to create a React Hook connected to a store.

```js
// store.js
import { createStoreHook } from 'immerst/react'

export const useStore = createStoreHook(store)
```

It accepts a previously created store, or a store creator function.


### Use store

To use the store hook, call the `useStore` function from inside a React component.

It returns the store's state and actions. It subscribes to the component to render on all state changes.

```js
// Component.js
import { useStore } from './store'

function Component() {

  // Subscribe to all state changes
  const { count, increment } = useStore()

  return <button onClick={() => increment()}>{count}</button>
}
```

#### Subscribe to partial changes

To subscribe to partial state changes for more efficient rendering of the component, pass a "selector" function to `useStore`. It should select properties of the store instance, and return an array or object.

```js
const [count, increment] = useStore(store => [
  store.count,
  store.increment
])
```

The above will update the component whenever the `count` property changes.
