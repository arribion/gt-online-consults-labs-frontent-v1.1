/**
 * Single source of truth for every domain model the app uses.
 *
 * Import from `@/types` rather than reaching into the individual files, so a
 * contract change lands in one place. Shapes here mirror the backend responses
 * documented in `client/openapi.json`.
 */

export * from "./api";
export * from "./auth";
export * from "./member";
export * from "./project";
export * from "./assignment";
export * from "./task";
export * from "./dispute";
export * from "./invoice";
export * from "./resource";
export * from "./ui";
