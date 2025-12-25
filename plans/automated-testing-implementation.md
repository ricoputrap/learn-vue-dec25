# Automated Testing Implementation Plan

**Project**: learn-vue-dec25 (Vue 3 PDF Chat Application)  
**Created**: 2024  
**Status**: 🚀 IN PROGRESS - Phase 1 Complete

---

## 1. Context Analysis

### Current State

**Files Identified:**

- `src/api.ts` - API functions for asking questions
- `src/config.ts` - Configuration constants
- `src/types.ts` - TypeScript type definitions
- `src/stores/chat.ts` - Pinia store for chat messages
- `src/stores/pdf.ts` - Pinia store for PDF uploads
- `src/composables/useChatActions.ts` - Composable for chat actions
- `src/components/ChatComposer.vue` - Input component
- `src/components/ChatHeader.vue` - Header component
- `src/components/ChatMessages.vue` - Messages display component
- `src/components/PdfUpload.vue` - PDF upload component
- `src/App.vue` - Main application component

**Current Testing Infrastructure:**

- ❌ No test framework installed
- ❌ No test files exist
- ❌ No test scripts in package.json
- ❌ No testing configuration files

**Testing Needs Identified:**

1. **Unit Tests**
   - API functions (`api.ts`)
   - Pinia stores (`chat.ts`, `pdf.ts`)
   - Composables (`useChatActions.ts`)
   - Utility functions (if any)

2. **Component Tests**
   - All Vue components (4 total)
   - Props validation
   - Event emission
   - User interactions

3. **Integration Tests**
   - Store + API integration
   - Component + Store integration
   - Full user flows

4. **E2E Tests** (Optional, Phase 2)
   - Complete user journeys
   - Multi-component interactions

---

## 2. Proposed Changes

### Testing Stack Recommendation

**Primary Stack: Vitest + Vue Test Utils**

- ✅ Vitest - Fast, Vite-native test runner
- ✅ @vue/test-utils - Official Vue component testing
- ✅ happy-dom - Lightweight DOM implementation
- ✅ @vitest/ui - Visual test UI (optional)

**Alternative Stack: Jest + Vue Test Utils**

- Requires more configuration
- Slower than Vitest
- Not recommended for Vite projects

### Files to Create/Modify

#### New Files to Create

1. **Configuration Files**
   - `vitest.config.ts` - Vitest configuration
   - `src/tests/setup.ts` - Test setup file
   - `.github/workflows/test.yml` - CI/CD (optional)

2. **Test Files - Unit Tests**
   - `src/api.test.ts` - API function tests
   - `src/stores/__tests__/chat.test.ts` - Chat store tests
   - `src/stores/__tests__/pdf.test.ts` - PDF store tests
   - `src/composables/__tests__/useChatActions.test.ts` - Composable tests

3. **Test Files - Component Tests**
   - `src/components/__tests__/ChatComposer.test.ts`
   - `src/components/__tests__/ChatHeader.test.ts`
   - `src/components/__tests__/ChatMessages.test.ts`
   - `src/components/__tests__/PdfUpload.test.ts`

4. **Test Files - Integration Tests**
   - `src/tests/integration/chat-flow.test.ts`
   - `src/tests/integration/pdf-upload-flow.test.ts`

5. **Test Utilities**
   - `src/tests/utils/test-helpers.ts` - Shared test utilities
   - `src/tests/utils/mock-data.ts` - Mock data generators
   - `src/tests/utils/mock-api.ts` - API mocks

#### Files to Modify

1. **`package.json`**
   - Add testing dependencies
   - Add test scripts
   - Add coverage scripts

2. **`tsconfig.json`** (possibly)
   - Add test file paths to include
   - Configure types for test environment

3. **`.gitignore`**
   - Add test coverage directories
   - Add test cache directories

### Detailed Test Coverage Plan

#### API Tests (`src/api.test.ts`)

```typescript
describe("askQuestion", () => {
  // Test successful question
  // Test empty question
  // Test network error
  // Test malformed response
  // Test missing answer in response
  // Test with custom fileId
});
```

#### Chat Store Tests (`src/stores/__tests__/chat.test.ts`)

```typescript
describe("useChatStore", () => {
  // Test initial state
  // Test addMessage adds message
  // Test addMessage trims whitespace
  // Test addMessage ignores empty strings
  // Test addMessage generates unique IDs
  // Test orderedMessages sorts correctly
  // Test clearMessages empties array
  // Test default sender is "You"
});
```

#### PDF Store Tests (`src/stores/__tests__/pdf.test.ts`)

```typescript
describe("usePdfStore", () => {
  // Test initial state
  // Test upload success
  // Test upload failure
  // Test upload with network error
  // Test isUploading computed property
  // Test reset function
  // Test error handling
  // Test FormData creation
});
```

#### useChatActions Tests (`src/composables/__tests__/useChatActions.test.ts`)

```typescript
describe("useChatActions", () => {
  // Test handleSend adds user message
  // Test handleSend calls API
  // Test handleSend adds system response
  // Test isThinking state changes
  // Test error handling
  // Test error message format
});
```

#### ChatComposer Tests (`src/components/__tests__/ChatComposer.test.ts`)

```typescript
describe("ChatComposer", () => {
  // Test renders input field
  // Test renders send button
  // Test renders clear button
  // Test emits send event with text
  // Test clears input after send
  // Test disabled state when busy
  // Test disabled state when empty
  // Test clear button emits clear event
  // Test clear button disabled state
  // Test form submission
});
```

#### ChatHeader Tests (`src/components/__tests__/ChatHeader.test.ts`)

```typescript
describe("ChatHeader", () => {
  // Test renders title
  // Test shows PDF name when provided
  // Test shows upload status
  // Test different status states
  // Test without PDF name
});
```

#### ChatMessages Tests (`src/components/__tests__/ChatMessages.test.ts`)

```typescript
describe("ChatMessages", () => {
  // Test renders empty state
  // Test renders messages
  // Test renders sender names
  // Test renders message text
  // Test correct order
  // Test auto-scrolling (if implemented)
});
```

#### PdfUpload Tests (`src/components/__tests__/PdfUpload.test.ts`)

```typescript
describe("PdfUpload", () => {
  // Test renders file input
  // Test accepts PDF files only
  // Test triggers upload on file select
  // Test shows upload progress
  // Test shows success state
  // Test shows error state
  // Test reset functionality
  // Test drag and drop (if implemented)
});
```

### Breaking Changes & Side Effects

**No Breaking Changes Expected:**

- Tests are additive, don't modify existing code
- Test files are separate from source files
- Testing doesn't affect build output

**Potential Issues:**

- ⚠️ May need to refactor some functions for testability (dependency injection)
- ⚠️ May discover bugs during test writing
- ⚠️ May need to add test IDs to components for reliable selection

---

## 3. Verification Strategy

### Test Coverage Goals

**Minimum Coverage:**

- 80% line coverage
- 80% branch coverage
- 80% function coverage
- 70% statement coverage

**Critical Path Coverage:**

- 100% API functions
- 100% Store actions
- 100% Composable functions
- 90% Component interactions

### How to Verify Tests Work

1. **Run Tests Locally**

   ```bash
   pnpm test
   pnpm test:coverage
   ```

2. **Visual Verification**

   ```bash
   pnpm test:ui  # Opens Vitest UI
   ```

3. **Check Coverage Reports**
   - View HTML coverage report in `coverage/index.html`
   - Check console output for coverage percentages

4. **CI/CD Verification**
   - All tests pass in GitHub Actions
   - Coverage meets minimum thresholds

### Success Criteria

✅ All unit tests pass  
✅ All component tests pass  
✅ All integration tests pass  
✅ Coverage meets minimum thresholds  
✅ No TypeScript errors in test files  
✅ Tests run in under 30 seconds  
✅ Documentation is clear and complete

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Setup Testing Infrastructure (Steps 1-8) ✅ COMPLETE

**Step 1: Install Testing Dependencies** ✅

```bash
pnpm add -D vitest @vue/test-utils happy-dom @vitest/ui @vitest/coverage-v8
```

- Added to package.json devDependencies

**Step 2: Create Vitest Configuration** ✅

- Created `vitest.config.ts`
- Configured test environment (happy-dom)
- Set up Vue plugin
- Configured path aliases
- Set coverage options with 80% thresholds

**Step 3: Update package.json** ✅

- Added `"test": "vitest"`
- Added `"test:ui": "vitest --ui"`
- Added `"test:coverage": "vitest --coverage"`
- Added `"test:run": "vitest run"`

**Step 4: Create Test Setup File** ✅

- Created `src/tests/setup.ts`
- Configured global test utilities
- Set up mock fetch
- Configured console mocks
- Added afterEach cleanup

**Step 5: Create Test Utilities** ✅

- Created `src/tests/utils/test-helpers.ts`
- Created mountWithPinia helper
- Created flushPromises utility
- Created waitFor utility
- Created mock file utilities
- Created DOM helper functions

**Step 6: Create Mock Data** ✅

- Created `src/tests/utils/mock-data.ts`
- Created mock message generators
- Created mock PDF data
- Created mock API responses
- Created mock fetch Response objects

**Step 7: Create API Mocks** ✅

- Created `src/tests/utils/mock-api.ts`
- Created fetch mock functions
- Created response builders
- Created error builders
- Created delay and spy utilities

**Step 8: Update .gitignore** ✅

- Added `coverage/`
- Added `.vitest/`
- Added `*.lcov`

### Phase 2: Write Unit Tests (Steps 9-12)

**Step 9: Write API Tests**

- Create `src/api.test.ts`
- Test all `askQuestion` scenarios
- Test error handling
- Test edge cases
- Aim for 100% coverage

**Step 10: Write Chat Store Tests**

- Create `src/stores/__tests__/chat.test.ts`
- Test all actions and getters
- Test state mutations
- Test computed properties
- Mock Date.now() for consistent IDs

**Step 11: Write PDF Store Tests**

- Create `src/stores/__tests__/pdf.test.ts`
- Test upload flow
- Mock fetch API
- Test error scenarios
- Test computed properties

**Step 12: Write Composable Tests**

- Create `src/composables/__tests__/useChatActions.test.ts`
- Test handleSend function
- Test isThinking state
- Mock dependencies (store, API)

### Phase 3: Write Component Tests (Steps 13-16)

**Step 13: Write ChatComposer Tests**

- Create `src/components/__tests__/ChatComposer.test.ts`
- Test props
- Test events
- Test user interactions
- Test disabled states

**Step 14: Write ChatHeader Tests**

- Create `src/components/__tests__/ChatHeader.test.ts`
- Test prop rendering
- Test conditional rendering
- Test status display

**Step 15: Write ChatMessages Tests**

- Create `src/components/__tests__/ChatMessages.test.ts`
- Test message rendering
- Test empty state
- Test message ordering

**Step 16: Write PdfUpload Tests**

- Create `src/components/__tests__/PdfUpload.test.ts`
- Test file selection
- Test upload trigger
- Test status display
- Test error handling

### Phase 4: Write Integration Tests (Steps 17-18)

**Step 17: Write Chat Flow Integration Test**

- Create `src/tests/integration/chat-flow.test.ts`
- Test complete chat flow
- Test store + API + component interaction
- Test error scenarios

**Step 18: Write PDF Upload Flow Integration Test**

- Create `src/tests/integration/pdf-upload-flow.test.ts`
- Test complete upload flow
- Test success and error paths
- Test state management

### Phase 5: Documentation & CI/CD (Steps 19-21)

**Step 19: Create Testing Documentation**

- Create `docs/TESTING.md`
- Document how to run tests
- Document how to write new tests
- Document testing best practices

**Step 20: Set Up CI/CD (Optional)**

- Create `.github/workflows/test.yml`
- Run tests on PR
- Check coverage thresholds
- Block merge if tests fail

**Step 21: Final Verification**

- Run all tests locally
- Check coverage report
- Verify CI/CD pipeline
- Update README with test badge

---

## 5. Testing Best Practices

### DO's ✅

- ✅ Write tests before fixing bugs (TDD when possible)
- ✅ Keep tests simple and focused
- ✅ Use descriptive test names
- ✅ Test behavior, not implementation
- ✅ Mock external dependencies
- ✅ Use arrange-act-assert pattern
- ✅ Test edge cases and error paths
- ✅ Keep tests fast (< 30s total)

### DON'Ts ❌

- ❌ Don't test third-party libraries
- ❌ Don't test implementation details
- ❌ Don't write flaky tests
- ❌ Don't skip error scenarios
- ❌ Don't make tests depend on each other
- ❌ Don't use real API calls in unit tests
- ❌ Don't test everything (focus on critical paths)

---

## 6. Estimated Timeline

**Phase 1 (Setup)**: 2-3 hours  
**Phase 2 (Unit Tests)**: 4-5 hours  
**Phase 3 (Component Tests)**: 4-5 hours  
**Phase 4 (Integration Tests)**: 2-3 hours  
**Phase 5 (Documentation & CI)**: 1-2 hours

**Total Estimated Time**: 13-18 hours

---

## 7. Dependencies to Install

```json
{
  "devDependencies": {
    "vitest": "^2.1.0",
    "@vue/test-utils": "^2.4.0",
    "happy-dom": "^15.0.0",
    "@vitest/ui": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0"
  }
}
```

---

## 8. Risk Assessment

### Low Risk ⚠️

- Adding test dependencies (isolated to dev)
- Creating test files (doesn't affect production)
- Setting up CI/CD (can be disabled)

### Medium Risk ⚠️⚠️

- Discovering bugs during testing (requires fixes)
- Need to refactor for testability (code changes)
- Coverage requirements too strict (adjust as needed)

### Mitigation Strategies

- Start with low-risk unit tests first
- Refactor code incrementally
- Adjust coverage goals based on reality
- Document any breaking changes immediately

---

## 9. Alternative Approaches Considered

### Approach A: Jest + Testing Library ❌

**Pros**: More familiar to some devs  
**Cons**: Slower, requires more config, not Vite-native  
**Decision**: Not recommended

### Approach B: Vitest + Vue Test Utils ✅ (Recommended)

**Pros**: Fast, Vite-native, minimal config, great DX  
**Cons**: Newer, less Stack Overflow content  
**Decision**: Recommended for this project

### Approach C: Cypress Component Testing 🤷

**Pros**: Great for E2E, visual testing  
**Cons**: Heavier, slower, overkill for unit tests  
**Decision**: Consider for Phase 2 E2E tests

---

## 10. Success Metrics

After implementation, we should have:

📊 **Coverage Metrics**

- 80%+ line coverage
- 80%+ branch coverage
- 80%+ function coverage

⚡ **Performance Metrics**

- Tests run in < 30 seconds
- No flaky tests
- Fast feedback loop

📝 **Quality Metrics**

- All critical paths tested
- Edge cases covered
- Error scenarios tested
- Clear test descriptions

---

## Decision

**Status**: 🚀 IN PROGRESS

**Approved**: ✅ Approach B (Vitest + Vue Test Utils)

### Approval Responses:

1. ✅ Plan approved
2. ✅ Coverage goals (80%) confirmed
3. ✅ CI/CD setup - Not required
4. ✅ No specific testing scenarios prioritized

**Current Phase**: Phase 1 ✅ Complete | Next: Phase 2 (Unit Tests)

---

## Implementation Progress

### ✅ Phase 1: Setup Testing Infrastructure - COMPLETE

- All 8 steps completed
- Testing infrastructure ready
- Run `pnpm install` to install dependencies
- Ready to proceed to Phase 2

### ⏳ Phase 2: Unit Tests - NEXT

- API tests
- Store tests
- Composable tests

**Next Action**: Install dependencies with `pnpm install`, then proceed with writing unit tests.
