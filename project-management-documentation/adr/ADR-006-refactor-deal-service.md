# ADR-006: Refactor `dealService.ts` for Improved Modularity and Maintainability

**Status:** Accepted
**Date:** 2024-07-29

## Context

The `lib/dealService.ts` file had grown significantly in size and complexity. It was responsible for a wide range of functionalities including:
*   Core CRUD (Create, Read, Update, Delete) operations for deals.
*   Processing of custom fields associated with deals.
*   Calculation of deal probabilities.
*   Generation of deal history and change logs.

This amalgamation of diverse responsibilities into a single file made it increasingly difficult to:
*   Understand the codebase.
*   Maintain and debug issues.
*   Test individual components effectively.
*   Onboard new developers to this part of the system.

The lack of modularity also increased the risk of unintended side effects when making changes.

## Decision

To address these issues, we decided to refactor `lib/dealService.ts` by decomposing its functionalities into smaller, more focused modules. These modules are organized within a new subdirectory: `lib/dealService/`.

The specific modules created are:
*   `lib/dealService/dealCrud.ts`: Handles the core CRUD operations for deals. This module now orchestrates calls to other specialized modules for tasks like custom field processing or probability calculation before performing database operations.
*   `lib/dealService/dealCustomFields.ts`: Contains logic specifically for processing custom fields during the creation and updating of deals.
*   `lib/dealService/dealProbability.ts`: Encapsulates the logic for calculating deal probability fields based on stage or other criteria.
*   `lib/dealService/dealHistory.ts`: Manages the generation of deal history records, such as tracking changes made to deal attributes.

The original `lib/dealService.ts` file has been transformed into a facade. It now primarily imports and re-exports the public functions from the newly created modules in the `lib/dealService/` directory. This maintains a consistent public API for other parts of the application that consume deal-related services, while the internal implementation is now modular.

## Consequences

### Positive
*   **Improved Modularity:** The codebase is now better organized, with clear separation of concerns. Each module has a well-defined responsibility.
*   **Enhanced Maintainability:** Smaller, focused modules are easier to understand, modify, and debug. Changes in one area of deal logic are less likely to impact others.
*   **Better Testability:** Individual modules can be unit-tested more effectively in isolation.
*   **Increased Readability:** The code is easier to navigate and comprehend.
*   **Easier Onboarding:** New developers can understand specific parts of the deal logic without needing to grasp the entire monolithic file at once.

### Negative
*   **Increased File Count:** The refactoring has resulted in a new directory and several new files, slightly increasing the overall number of files in the `lib/` directory.
*   **Potential for Import/Export Complexity:** While managed during this refactor, introducing more modules requires careful management of imports and exports to avoid circular dependencies or overly complex dependency graphs. (This was handled successfully).

### Neutral
*   The public API of `dealService` remains largely unchanged from the perspective of its consumers, minimizing the impact on other parts of the application.

## Participants
*   AI Assistant (Gemini 2.5 Pro)
*   User (Tomas Kovarik) 