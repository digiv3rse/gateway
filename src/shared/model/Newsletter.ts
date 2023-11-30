import { z } from 'zod';

export const newsletterPatchSchema = z.object({
	id: z.string(),
	subscribed: z.boolean(),
});
export type NewsletterPatch = z.infer<typeof newsletterPatchSchema>;

export interface NewsLetter {
	id: string;
	nameId: string;
	description: string;
	frequency?: string;
	name: string;
	subscribed?: boolean;
}

export enum Newsletters {
	DOWN_TO_EARTH = '4147',
	FIRST_EDITION_UK = '4156',
	THE_LONG_READ = '4165',
	// US newsletters
	HEADLINES_US = '4152',
	FIRST_THING_US = '4300',
	SOCCER_US = '6030',
	// AUS newsletters
	MORNING_MAIL_AU = '4148',
	AFTERNOON_UPDATE_AU = '6023',
	FIVE_GREAT_READS_AU = '6019',
	THE_CRUNCH_AU = '6034',
	// EU newsletters
	TECHSCAPE = '6013',
	THIS_IS_EUROPE = '4234',
}

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);
