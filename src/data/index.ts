/**
 * Mock data layer — single import surface: `import { athletes, getAthlete, ... } from '@/data'`.
 * All data is fictional demo content (design.md sec. 10). Page agents: read from here,
 * persist demo CRUD to localStorage under `shs-*` keys if you need mutations.
 */
export * from './types';
export * from './athletes';
export * from './clubs';
export * from './scouts';
export * from './competitions';
export * from './matches';
export * from './statistics';
export * from './rankings';
export * from './videos';
export * from './opportunities';
export * from './sponsors';
export { DemoSessionProvider, useDemoSession, demoPersonas, roleDashboardPath } from './demoSession';
