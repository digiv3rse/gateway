import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';
import { EmailType } from '@/shared/model/EmailType';
import { QueryParams } from '@/shared/model/QueryParams';
import { Participations } from '@guardian/ab-core';
import { Stage } from '@/server/models/Configuration';
import { ConsentPath, RoutePaths } from '@/shared/model/Routes';

export interface FieldError {
  field: string;
  message: string;
}
interface ABTesting {
  mvtId?: number;
  participations?: Participations;
  forcedTestVariants?: Participations;
}

interface GlobalMessage {
  error?: string;
  success?: string;
}

export interface PageData {
  // general page data
  returnUrl?: string;
  email?: string;
  signInPageUrl?: string;
  geolocation?: GeoLocation;
  fieldErrors?: Array<FieldError>;
  browserName?: string;

  // email sent pages specific
  emailType?: EmailType;
  resendEmailAction?: RoutePaths;
  changeEmailPage?: RoutePaths;

  // onboarding specific
  newsletters?: NewsLetter[];
  consents?: Consent[];
  page?: ConsentPath;
  previousPage?: ConsentPath;

  // reset password token specific
  timeUntilTokenExpiry?: number;

  // jobs specific
  firstName?: string;
  secondName?: string;
  userBelongsToGRS?: boolean;
}

export interface RecaptchaConfig {
  recaptchaSiteKey: string;
}

export interface SentryConfig {
  build?: string;
  stage?: Stage;
  dsn: string;
}

export interface ClientHosts {
  idapiBaseUrl: string;
  oauthBaseUrl: string;
}

export interface ClientState {
  queryParams: QueryParams;
  globalMessage?: GlobalMessage;
  pageData?: PageData;
  csrf?: CsrfState;
  abTesting?: ABTesting;
  clientHosts: ClientHosts;
  recaptchaConfig: RecaptchaConfig;
  sentryConfig: SentryConfig;
}

export type CsrfState = {
  token?: string;
  pageUrl?: string;
};
