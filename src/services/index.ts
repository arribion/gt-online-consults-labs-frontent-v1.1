/**
 * Every network call in the app goes through one of these. Components import
 * services, never axios — that keeps the base URL, credentials, error shape and
 * token refresh in exactly one place (`./api`).
 */

export { apiClient, API_ROOT, errorMessage, downloadFile } from "./api";
export { authService } from "./auth.service";
export { membersService } from "./members.service";
export { projectsService } from "./projects.service";
export { assignmentsService } from "./assignments.service";
export { tasksService } from "./tasks.service";
export { disputesService } from "./disputes.service";
export { invoicesService } from "./invoices.service";
export { resourcesService } from "./resources.service";
export { healthService } from "./health.service";
