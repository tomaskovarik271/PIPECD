import '@testing-library/jest-dom/vitest'; // Use the vitest specific import
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Add any global setup for tests here 