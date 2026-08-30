import { ApplicationEntry, ApplicationId } from './master-data-types';

/**
 * APPLICATION REGISTRY
 * 
 * Master registry of generic applications (e.g. Excavator, Loader, Bus).
 */
export const APPLICATION_REGISTRY: Record<ApplicationId, ApplicationEntry> = {};
