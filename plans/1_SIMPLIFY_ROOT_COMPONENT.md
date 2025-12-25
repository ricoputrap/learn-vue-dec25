# Implementation Plan: Refactor `handleSend` Logic

## 1. Context Analysis

### Files Involved

- **`src/App.vue`** - Currently contains the `handleSend` function and manages the `isThinking` state
- **`src/components/ChatComposer.vue`** - Emits the "send" event with text, but doesn't handle the API logic
- **`src/stores/chat.ts`** - Store for managing chat messages
- **`src/stores/pdf.ts`** - Store for PDF state (not directly involved but referenced)
- **`src/api.ts`** - Contains the `askQuestion` API function

### Current Logic Flow

1. User types in `ChatComposer` and clicks Send
2. `ChatComposer` emits "send" event with text
3. `App.vue` receives event and calls `handleSend`
4. `handleSend` adds user message to store, calls API, adds response to store
5. `App.vue` passes `isThinking` state down to `ChatComposer` as `isBusy` prop

### Problem Identified

The current architecture has `App.vue` acting as a controller, which is reasonable, but creates tight coupling between the parent and child component for business logic.

## 2. Proposed Changes

### Approach Analysis

I've identified **three possible approaches**:

#### **Approach A: Move Everything to ChatComposer** ❌ (Not Recommended)

- Move `handleSend` and `isThinking` into `ChatComposer.vue`
- **Pros**: Self-contained component
- **Cons**: Violates single responsibility - ChatComposer should just handle input, not business logic

#### **Approach B: Create a Composable** ✅ (Recommended)

- Extract `handleSend` logic into a reusable composable (e.g., `useChatActions.ts`)
- Keep presentation logic in components
- **Pros**: Separation of concerns, reusable, testable, follows Vue 3 best practices
- **Cons**: Adds one more file

#### **Approach C: Keep Current Structure** 🤷

- Leave as-is since App.vue as a controller is a valid pattern
- **Pros**: No changes needed
- **Cons**: Doesn't address your concern about coupling

### **Recommended: Approach B - Create Composable**

#### Files to Modify/Create:

1. **`src/composables/useChatActions.ts`** (NEW)
   - Create new composable to handle chat actions
   - Export `handleSend` function and `isThinking` state
   - Import and use chat store, API function

2. **`src/App.vue`** (MODIFY)
   - Remove `handleSend` function
   - Remove `isThinking` ref
   - Import and use the composable
   - Pass composable returns to `ChatComposer`

3. **`src/components/ChatComposer.vue`** (OPTIONAL ENHANCE)
   - Could optionally use the composable directly instead of emitting
   - However, keeping the emit pattern maintains better component reusability

#### Detailed Changes:

**New File: `src/composables/useChatActions.ts`**

```typescript
// Contains:
// - isThinking ref
// - handleSend function (async)
// - Uses useChatStore()
// - Calls askQuestion() API
// - Returns { handleSend, isThinking }
```

**Modified: `src/App.vue`**

```typescript
// Remove: async function handleSend()
// Remove: const isThinking = ref(false)
// Add: const { handleSend, isThinking } = useChatActions()
// Keep: Everything else the same
```

**Optional Enhancement: `src/components/ChatComposer.vue`**

```typescript
// Option 1: Keep current emit pattern (cleaner, more reusable)
// Option 2: Use composable directly (less prop drilling, but couples to business logic)
```

### Breaking Changes & Side Effects

- **None** - This is a pure refactor that maintains the same external API
- All props and events remain the same
- Component behavior is identical from a user perspective

## 3. Verification Strategy

### Manual Checks

1. ✅ User can type and send messages
2. ✅ Message appears in chat immediately
3. ✅ "Thinking..." state shows during API call
4. ✅ System response appears after API returns
5. ✅ Error messages display correctly on API failure
6. ✅ Clear button still works
7. ✅ Send button disables during thinking state

### Code Quality Checks

1. ✅ TypeScript compiles without errors
2. ✅ No console errors in browser
3. ✅ Linting passes (if configured)
4. ✅ Hot reload works during development

### Future Testing Opportunities

- Unit test the composable separately from components
- Mock the chat store and API in tests
- Test error handling scenarios

## 4. Step-by-Step Implementation Plan

### Phase 1: Create Composable

1. Create new directory `src/composables/` if it doesn't exist
2. Create `src/composables/useChatActions.ts`
3. Move the `handleSend` function from `App.vue` to the composable
4. Move the `isThinking` ref to the composable
5. Import necessary dependencies (`useChatStore`, `askQuestion`, `ref`)
6. Export an object with `{ handleSend, isThinking }`

### Phase 2: Update App.vue

7. Remove the `handleSend` function from `App.vue`
8. Remove the `isThinking` ref from `App.vue`
9. Import `useChatActions` composable
10. Call the composable and destructure its return
11. Verify all references to `handleSend` and `isThinking` still work

### Phase 3: Test & Verify

12. Run the development server
13. Test sending a message
14. Verify the thinking state appears
15. Verify the response appears
16. Test error handling (if possible)
17. Test the Clear button functionality

### Phase 4: Optional Enhancement (if approved)

18. Optionally refactor `ChatComposer.vue` to use the composable directly
19. Remove the emit pattern if going this route
20. Update tests accordingly

---

## Recommendation Summary

**I recommend Approach B (Create Composable)** because it:

- ✅ Follows Vue 3 Composition API best practices
- ✅ Separates business logic from presentation
- ✅ Makes the logic reusable and testable
- ✅ Doesn't break existing component contracts
- ✅ Maintains single responsibility principle
- ✅ Enables future enhancement (e.g., using the composable in other components)

**However, I suggest keeping the emit pattern in ChatComposer** because:

- ✅ ChatComposer remains a "dumb" presentational component
- ✅ More reusable in different contexts
- ✅ Easier to test in isolation
- ✅ Follows Vue component design patterns

---

## Decision

**Status**: ✅ COMPLETED

**Approval**: Approved - Approach B (Create Composable)

**Implementation Date**: 2024

### What Was Completed:

#### Phase 1: Create Composable ✅

- ✅ Created `src/composables/` directory
- ✅ Created `src/composables/useChatActions.ts`
- ✅ Moved `handleSend` function to the composable
- ✅ Moved `isThinking` ref to the composable
- ✅ Imported all necessary dependencies (`useChatStore`, `askQuestion`, `ref`)
- ✅ Exported `{ handleSend, isThinking }`

#### Phase 2: Update App.vue ✅

- ✅ Removed `handleSend` function from `App.vue`
- ✅ Removed `isThinking` ref from `App.vue`
- ✅ Imported `useChatActions` composable
- ✅ Called composable and destructured its return values
- ✅ All references to `handleSend` and `isThinking` remain functional

#### Phase 3: Test & Verify ⏳

**Next Steps**: Manual testing required

- User should test sending messages
- Verify "Thinking..." state appears
- Verify responses appear correctly
- Test error handling
- Test Clear button functionality

#### Phase 4: Optional Enhancement ⏸️

**Status**: Not implemented (keeping emit pattern as recommended)

- ChatComposer remains a presentational component
- Maintains better reusability and separation of concerns

---

**Created**: 2024
**Author**: AI Assistant
**Purpose**: Refactoring documentation for improving component architecture
