import { z } from 'zod';
import { userConsentSchema } from './User';
import { newsletterPatchSchema } from './Newsletter';

export interface Consent {
	id: string;
	name: string;
	description?: string;
	consented?: boolean;
}

export enum Consents {
	ADVERTISING = 'personalised_advertising',
	// OPT OUT API CONSENTS (modeled as opt ins in Gateway)
	PROFILING = 'profiling_optin',
	// PRODUCT CONSENTS
	SUPPORTER = 'supporter',
	JOBS = 'jobs',
	HOLIDAYS = 'holidays',
	EVENTS = 'events',
	OFFERS = 'offers',
	SIMILAR_GUARDIAN_PRODUCTS = 'similar_guardian_products',
}

export const CONSENTS_DATA_PAGE: string[] = [
	Consents.PROFILING, // modelled as an opt in in Gateway
	Consents.ADVERTISING,
];

export const CONSENTS_COMMUNICATION_PAGE: string[] = [Consents.SUPPORTER];

export const CONSENTS_POST_SIGN_IN_PAGE: string[] = [Consents.SUPPORTER];

export const CONSENTS_NEWSLETTERS_PAGE: string[] = [Consents.EVENTS];

export const registrationConsentsSchema = z
	.object({
		consents: userConsentSchema.array().optional(),
		newsletters: newsletterPatchSchema.array().optional(),
	})
	.strict();

export type RegistrationConsents = z.infer<typeof registrationConsentsSchema>;
