# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Backend (Express + SQLite)
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with watch mode (port 3000)
npm start            # Start production server
npm test             # Run tests
```

### Frontend (Vue 3 + Vite)
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
```

## Architecture

```
shopping-app/
├── backend/                 # Express REST API server
│   ├── src/
│   │   ├── index.js         # Express app entry point
│   │   ├── database.js      # SQLite connection & schema
│   │   └── routes/
│   │       └── items.js     # CRUD API endpoints
│   └── __tests__/           # Backend tests
├── frontend/                # Vue 3 SPA
│   ├── src/
│   │   ├── main.js          # Vue app entry point
│   │   ├── App.vue          # Root component
│   │   ├── composables/     # Vue composables (useApi.js)
│   │   └── components/      # Vue components
│   └── __tests__/           # Frontend tests
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | Get items (supports ?search=, ?category=, ?priority=, ?purchased=, ?sort=, ?order=) |
| GET | /api/items/stats | Get statistics |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

## Testing Rules

### Test Code Quality Requirements

1. **Tests must verify actual functionality**
   - Never write meaningless tests like `expect(true).toBe(true)`
   - Each test case must verify specific inputs and outputs

2. **Concrete IN/OUT verification**
   - Test with realistic data
   - Verify return values, state changes, and side effects
   - Check both success and failure scenarios

3. **Minimal mocking**
   - Use mocks only when necessary (external APIs, timers, etc.)
   - Prefer integration tests over heavily mocked unit tests
   - Document why mocks are needed

4. **No hardcoding to pass tests**
   - Don't write implementation code just to make tests pass
   - Tests should fail for the right reasons
   - Implementation should be correct, not test-specific

5. **Edge cases and error handling**
   - Test boundary values (empty, null, max values)
   - Test error scenarios (invalid input, network errors)
   - Test edge cases specific to the feature

6. **Understand before testing**
   - Read and understand the feature specification
   - Understand the expected behavior before writing tests
   - Test the contract, not the implementation

### Test Structure
```javascript
describe('Feature/Component', () => {
  describe('method/behavior', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange - setup test data
      // Act - execute the code
      // Assert - verify the result
    });
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```
