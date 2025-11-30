# React Hooks: useMemo, useCallback, and Loading States
## Understanding When and How to Use Each Tool

---

## 🎯 The Core Problem: Reference Equality

React uses **reference equality** to determine if something changed:
- **Primitives** (string, number, boolean): Compared by **value**
  ```js
  "hello" === "hello"  // true ✅
  ```
- **Objects/Arrays**: Compared by **reference** (memory address)
  ```js
  [1, 2, 3] === [1, 2, 3]  // false ❌ (different memory locations)
  {a: 1} === {a: 1}        // false ❌ (different memory locations)
  ```

**This is why your infinite loop happened!**
- `location.state.possibleMatches` creates a **new array reference** every render
- Even if contents are identical `[1,2,3]`, React sees it as "changed"
- This triggers re-renders → effects → state updates → more re-renders → loop

---

## 🔧 Tool #1: `useMemo` - Memoize Values

### What It Does
Stores a computed value and only recalculates when dependencies change.

### When to Use
1. **Expensive computations** (filtering large arrays, complex calculations)
2. **Stabilizing object/array references** (preventing child re-renders)
3. **Derived state** that depends on other values

### Syntax
```js
const memoizedValue = useMemo(() => {
  // Expensive computation or object creation
  return computeExpensiveValue(a, b);
}, [a, b]); // Only recalculate when a or b changes
```

### Real Example from Your Code
```js
// ❌ BEFORE: Creates new object on every render
const airportsToFetch = {
  ICAOairportCode: searchValue?.metadata?.ICAO,
  referenceId: searchValue?.referenceId,
};

// ✅ AFTER: Only creates new object when searchValue changes
const airportsToFetch = useMemo(() => ({
  ICAOairportCode: searchValue?.metadata?.ICAO,
  referenceId: searchValue?.referenceId,
}), [searchValue]);
```

### Your Fix for `possibleMatches`
```js
// Problem: location.state.possibleMatches is a new array every render
const possibleMatches = location?.state?.possibleMatches;

// Solution: Memoize with deep comparison
const possibleMatchesRef = useRef(null);
const possibleMatches = useMemo(() => {
  const raw = location?.state?.possibleMatches;
  if (!raw) return undefined;
  
  const serialized = JSON.stringify(raw);
  // If contents same, return previous reference
  if (possibleMatchesRef.current?.serialized === serialized) {
    return possibleMatchesRef.current.data;
  }
  // Contents changed - store new reference
  possibleMatchesRef.current = { data: raw, serialized };
  return raw;
}, [location?.state?.possibleMatches]);
```

**Key Insight**: We're using a `ref` to store the previous serialized value, then comparing strings (cheap) instead of deep-comparing arrays (expensive).

---

## 🔧 Tool #2: `useCallback` - Memoize Functions

### What It Does
Stores a function and only recreates it when dependencies change.

### When to Use
1. **Passing functions to memoized children** (React.memo components)
2. **Functions in dependency arrays** (useEffect, useMemo, other hooks)
3. **Event handlers** that are passed as props

### Syntax
```js
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Only recreate when a or b changes
```

### Example
```js
// ❌ BEFORE: New function on every render
const handleClick = () => {
  console.log(value);
};

// ✅ AFTER: Same function reference unless value changes
const handleClick = useCallback(() => {
  console.log(value);
}, [value]);

// Now you can safely use it in dependencies
useEffect(() => {
  window.addEventListener('click', handleClick);
  return () => window.removeEventListener('click', handleClick);
}, [handleClick]); // Won't re-run unnecessarily
```

### When NOT to Use
- **Simple functions** that aren't passed as props
- **Functions with no dependencies** (just define them outside the component)
- **Functions that change every render anyway** (no benefit)

---

## 🔧 Tool #3: Loading States - Control Effect Execution

### What They Do
Prevent effects from running during transitions or when data isn't ready.

### When to Use
1. **Preventing effects during navigation**
2. **Gating async operations** (don't fetch if already loading)
3. **Conditional effect execution** (only run when certain conditions met)

### Example Pattern
```js
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  // Guard: Don't run if already loading
  if (isLoading) return;
  
  // Guard: Don't run if no search value
  if (!searchValue) return;
  
  setIsLoading(true);
  fetchData().then(() => setIsLoading(false));
}, [searchValue]); // Effect runs when searchValue changes
```

### Your Code Pattern
```js
// In useFlightData hook
useEffect(() => {
  // Guard: Don't fetch if not a flight search
  if (searchValue?.type !== "flight") return;
  
  // Guard: Don't fetch if already loading
  if (loadingFlight) return;
  
  fetchFlightData();
}, [searchValue]); // Only depends on searchValue
```

---

## 🎓 Knowledge Gaps Filled

### Gap #1: "Why does my array cause re-renders?"
**Answer**: Arrays are compared by reference, not value. Every `[]` creates a new reference.

**Solution**: Use `useMemo` to stabilize the reference.

### Gap #2: "When should I use useMemo vs useCallback?"
**Answer**: 
- `useMemo` → for **values** (objects, arrays, primitives)
- `useCallback` → for **functions**

**Rule of thumb**: If you're storing a result, use `useMemo`. If you're storing a function, use `useCallback`.

### Gap #3: "How do I prevent infinite loops?"
**Answer**: 
1. **Stabilize references** with `useMemo`/`useCallback`
2. **Fix dependency arrays** (include all used values)
3. **Use loading states** to gate effects
4. **Use refs** for values that shouldn't trigger re-renders

### Gap #4: "What's the difference between dependency array bugs?"
**Answer**:
- **Missing dependency**: Effect doesn't run when it should (stale closures)
- **Extra dependency**: Effect runs too often (unnecessary re-renders)
- **Wrong dependency**: Effect runs at wrong times (bugs)

**Your bug**: `possibleMatches` was used in `useMemo` but not in dependency array → stale value!

---

## 🛠️ The Minimalist Fix Applied

### Change #1: Fixed Dependency Array
```js
// ❌ BEFORE: possibleMatches used but not in deps
const airportsToFetch = useMemo(() => {
  if (possibleMatches) return null; // Using possibleMatches
  // ...
}, [searchValue]); // But not listed!

// ✅ AFTER: All used values in deps
}, [searchValue, possibleMatches]); // Now correct
```

### Change #2: Memoized possibleMatches
```js
// Stabilizes the array reference so it only changes when data actually changes
const possibleMatches = useMemo(() => {
  // ... deep comparison logic with ref
}, [location?.state?.possibleMatches]);
```

---

## 📚 Quick Reference

| Tool | Use For | Example |
|------|---------|---------|
| `useMemo` | Expensive calculations, stabilizing object/array refs | `const data = useMemo(() => process(items), [items])` |
| `useCallback` | Functions passed to memoized children, functions in deps | `const handler = useCallback(() => {}, [dep])` |
| Loading States | Gating effects, preventing duplicate fetches | `if (loading) return; fetchData()` |
| `useRef` | Storing values that don't trigger re-renders | `const prev = useRef(); prev.current = value` |

---

## 🎯 Key Takeaways

1. **React compares by reference** for objects/arrays → use `useMemo` to stabilize
2. **Dependency arrays must include all used values** → prevents stale closures
3. **Loading states gate effects** → prevents duplicate operations
4. **Refs store values without triggering re-renders** → useful for comparisons
5. **Minimalist approach**: Fix dependency arrays first, then add memoization if needed

---

## 🔍 Debugging Checklist

When you see infinite loops or unnecessary re-renders:

- [ ] Are all used values in dependency arrays?
- [ ] Are objects/arrays being recreated on every render?
- [ ] Should I memoize this value/function?
- [ ] Is there a loading state that should gate this effect?
- [ ] Am I comparing by reference when I should compare by value?

---

## 💡 Pro Tips

1. **Start simple**: Don't memoize everything. Only when you see performance issues.
2. **Use React DevTools Profiler**: See what's actually causing re-renders.
3. **JSON.stringify for deep comparison**: Quick but not perfect (order matters, no functions).
4. **Consider libraries**: `lodash.isEqual` for deep equality, `use-deep-compare-effect` for effects.
5. **Read the warnings**: React's exhaustive-deps ESLint rule catches most dependency bugs.

---

*This guide was created to explain the infinite loop fix in `Combined.tsx` and help you understand React hooks better.*

