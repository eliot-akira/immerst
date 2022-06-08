# Immerst

Modular immutable state management

## Usage

### Create store

Use `createStore` 

```js
// store.js
import { createStore } from 'immerst'

export const useStore = createStore((get, set) => ({
  count: 0,
  increment() {
    const { count } = get()
    set({
      count: count + 1
    })
  },
}))
```

### Use store

To use the store, call the `useStore` function from inside a React component. It returns the store's state and actions. It subscribes to the component to render on all state changes.

```js
// Component.js
import { useStore } from './store'

function Component() {

  // Subscribe to all state changes
  const { count, store } = useStore()

  return <button onClick={() => increment()}>{count}</button>
}
```

#### Subscribe to changes

Subscribe to store property changes for more efficient rendering of the component. Pass a "selector" function to `useStore`, that will select properties of the store instance.

```js
const [count, incremement] = useStore(store => [
  store.count,
  store.increment
])
```
