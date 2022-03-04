import { Request, Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import {
  ABTesting,
  ClientHosts,
  CsrfState,
  PageData,
  RecaptchaConfig,
  SentryConfig,
} from '@/shared/model/ClientState';
import { ABTestAPI } from '@guardian/ab-core';
import { OphanConfig } from '@/server/lib/ophan';
import Bowser from 'bowser';

export interface RequestState {
  globalMessage: {
    error?: string;
    success?: string;
  };
  pageData: PageData;
  queryParams: QueryParams;
  csrf: CsrfState;
  abTesting: ABTesting;
  abTestAPI: ABTestAPI;
  clientHosts: ClientHosts;
  recaptchaConfig: RecaptchaConfig;
  ophanConfig: OphanConfig;
  sentryConfig: SentryConfig;
  browser: Bowser.Parser.Details;
}

export interface ResponseWithRequestState extends Response {
  locals: RequestState;
}

export interface RequestWithTypedQuery extends Request {
  query: Record<keyof QueryParams, string | undefined>;
}
