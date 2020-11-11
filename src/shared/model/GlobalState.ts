import { FieldError } from '@/server/routes/changePassword';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';

export interface GlobalMessage {
  error?: string;
  success?: string;
}

export interface PageData {
  // general page data
  returnUrl?: string;
  email?: string;
  emailProvider?: string;
  signInPageUrl?: string;
  geolocation?: GeoLocation;
  fieldErrors?: Array<FieldError>;

  // onboarding specific
  newsletters?: NewsLetter[];
  consents?: Consent[];
  page?: string;
  previousPage?: string;
}

export interface GlobalState {
  globalMessage?: GlobalMessage;
  pageData?: PageData;
  csrf?: CsrfState;
}

export type CsrfState = {
  token?: string;
  pageUrl?: string;
};
