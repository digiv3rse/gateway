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
	EVENTS = 'events',
	SIMILAR_GUARDIAN_PRODUCTS = 'similar_guardian_products',
}

export const CONSENTS_DATA_PAGE: string[] = [
	Consents.PROFILING, // modelled as an opt in in Gateway
	Consents.ADVERTISING,
];

export const CONSENTS_NEWSLETTERS_PAGE: string[] = [Consents.EVENTS];

export const REGISTRATION_CONSENTS: string[] = [
	Consents.SIMILAR_GUARDIAN_PRODUCTS,
];
