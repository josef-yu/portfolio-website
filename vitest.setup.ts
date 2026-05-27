import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees after every test so event listeners from hooks don't
// leak across tests (RTL's auto-cleanup relies on a global afterEach which
// vitest doesn't expose unless globals:true is set).
afterEach(cleanup);
