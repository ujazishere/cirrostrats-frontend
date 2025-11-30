# useCallback Analysis: Where You Need It

## 🎯 Current Status

### ✅ Already Using useCallback (Good!)
- `fetchAdditionalSuggestions` in `useSuggestions.ts` (line 140) - Used in dependency array

### ❌ Should Use useCallback (Missing)

---

## 📍 Location #1: `src/pages/Details.tsx`

### Functions Passed to Lazy-Loaded Component

**Problem**: These functions are recreated on every render, causing `FeedbackPopup` (lazy-loaded) to re-render unnecessarily.

```tsx
// ❌ CURRENT: New function on every render
const handleFeedbackClick = (e: any) => {
  e.preventDefault();
  setShowFeedbackPopup(true);
};

const handleCloseFeedback = () => {
  setShowFeedbackPopup(false);
  setFeedbackMessage("");
  setFeedbackType("Data Discrepancy");
};

const handleSubmitFeedback = async () => {
  // ... async logic
};
```

**Fix**: Memoize them since they're passed as props to `FeedbackPopup`:

```tsx
// ✅ FIXED: Stable function reference
const handleFeedbackClick = useCallback((e: any) => {
  e.preventDefault();
  setShowFeedbackPopup(true);
}, []); // No dependencies - only uses setState

const handleCloseFeedback = useCallback(() => {
  setShowFeedbackPopup(false);
  setFeedbackMessage("");
  setFeedbackType("Data Discrepancy");
}, []); // No dependencies - only uses setters

const handleSubmitFeedback = useCallback(async () => {
  if (!feedbackMessage.trim()) return;
  setIsSubmitting(true);
  // ... rest of logic
}, [feedbackMessage, feedbackType, userEmail, searchValue]); // Dependencies: values used inside
```

**Why**: `FeedbackPopup` is lazy-loaded with `React.lazy()`. Even though it's not wrapped in `React.memo`, stable function references prevent unnecessary re-renders when the parent re-renders.

---

## 📍 Location #2: `src/pages/Details.tsx`

### `handleSuggestionClick` Function

**Problem**: New function created every render, but currently commented out in usage.

```tsx
// ❌ CURRENT
const handleSuggestionClick = (suggestion: any) => {
  navigate("/details", { 
    state: { searchValue: suggestion } 
  });
};
```

**Fix**: Memoize if you plan to use it:

```tsx
// ✅ FIXED
const handleSuggestionClick = useCallback((suggestion: any) => {
  navigate("/details", { 
    state: { searchValue: suggestion } 
  });
}, [navigate]); // navigate is stable from useNavigate hook
```

**Why**: If you pass this to child components or use it in dependency arrays, you need a stable reference.

---

## 📍 Location #3: `src/components/Input/components/SearchInput.tsx`

### `handleRemoveRecent` Function

**Problem**: Created on every render, passed to `onClick` in render loop.

```tsx
// ❌ CURRENT (line 53)
const handleRemoveRecent = (
  e: React.MouseEvent,
  itemToRemove: FormattedSuggestion,
) => {
  e.stopPropagation();
  // ... localStorage logic
  refreshRecentSearches();
};
```

**Fix**: Memoize it:

```tsx
// ✅ FIXED
const handleRemoveRecent = useCallback((
  e: React.MouseEvent,
  itemToRemove: FormattedSuggestion,
) => {
  e.stopPropagation();
  // ... localStorage logic
  refreshRecentSearches();
}, [refreshRecentSearches]); // Depends on refreshRecentSearches from hook
```

**Why**: This function is created inside `renderOption` which runs for every suggestion. Memoizing prevents creating new functions for each item.

---

## 📍 Location #4: `src/components/Input/hooks/useSuggestions.ts`

### `refreshRecentSearches` Function

**Problem**: Returned from hook but not memoized, causing re-renders when passed to components.

```tsx
// ❌ CURRENT (line 275)
refreshRecentSearches: () => {
  setLocalRecentSearches(getRecentSearchesFromLocalStorage());
},
```

**Fix**: Memoize it:

```tsx
// ✅ FIXED
const refreshRecentSearches = useCallback(() => {
  setLocalRecentSearches(getRecentSearchesFromLocalStorage());
}, []); // No dependencies - only uses setState

// Then return it:
return {
  // ...
  refreshRecentSearches,
};
```

**Why**: This function is used in `SearchInput.tsx` and passed around. Stable reference prevents unnecessary re-renders.

---

## 📍 Location #5: `src/components/Input/hooks/useInputHandlers.ts`

### Functions Returned from Hook

**Problem**: Functions like `handleSubmit`, `handleInputChange`, etc. are recreated on every render.

**Current**: Functions are defined normally, not memoized.

**Fix**: Memoize functions that are:
1. Passed as props to child components
2. Used in dependency arrays
3. Expensive to recreate

```tsx
// ✅ EXAMPLE: handleSubmit
const handleSubmit = useCallback((
  e: any,
  submitTerm: any,
  userEmail: string,
  suggestions: FormattedSuggestion[] = [],
): void => {
  // ... existing logic
}, [navigate]); // Only navigate is a dependency (from useNavigate)

// ✅ EXAMPLE: handleInputChange
const handleInputChange = useCallback((
  _event: any,
  newInputValue: string,
  _userEmail: string,
): void => {
  setInputValue(newInputValue);
}, []); // No dependencies - only uses setState
```

**Why**: These functions are passed to `SearchInput` component and used in event handlers. Stable references prevent unnecessary re-renders.

---

## 🎓 Priority Ranking

### High Priority (Do These First)
1. **`handleSubmitFeedback`** in `Details.tsx` - Used in lazy-loaded component
2. **`handleCloseFeedback`** in `Details.tsx` - Used in lazy-loaded component
3. **`refreshRecentSearches`** in `useSuggestions.ts` - Used in dependency chains

### Medium Priority
4. **`handleRemoveRecent`** in `SearchInput.tsx` - Created in render loop
5. **`handleSubmit`** in `useInputHandlers.ts` - Passed to Autocomplete

### Low Priority (Only if Performance Issues)
6. **`handleInputChange`** in `useInputHandlers.ts` - Called frequently but simple
7. **`handleFeedbackClick`** in `Details.tsx` - Simple, rarely called

---

## 🚫 When NOT to Use useCallback

**Don't memoize these** (they're fine as-is):
- Simple event handlers that aren't passed as props
- Functions with no dependencies that are only used locally
- Functions that change every render anyway (no benefit)

**Example of unnecessary useCallback:**
```tsx
// ❌ UNNECESSARY - only used locally, not passed anywhere
const handleLocalClick = useCallback(() => {
  console.log('clicked');
}, []);
```

---

## 💡 Quick Decision Tree

```
Is the function:
├─ Passed as prop to child component?
│  └─ YES → use useCallback
├─ Used in dependency array of useEffect/useMemo?
│  └─ YES → use useCallback
├─ Created inside a render loop (map, filter)?
│  └─ YES → use useCallback
└─ Only used locally, simple, no dependencies?
   └─ NO → Don't use useCallback
```

---

## 🔧 Implementation Order

1. Start with **Details.tsx** feedback handlers (easiest, biggest impact)
2. Then **useSuggestions.ts** refreshRecentSearches
3. Then **SearchInput.tsx** handleRemoveRecent
4. Finally **useInputHandlers.ts** if you see performance issues

---

*Remember: useCallback is an optimization. Don't overuse it - only when you see actual performance problems or when functions are passed to memoized components.*

