import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getPersistableQueryParams } from '@/shared/lib/queryParams';
import { RoutePaths } from '@/shared/model/Routes';
import {
  generateAuthorizationState,
  setAuthorizationStateCookie,
  ProfileOpenIdClientRedirectUris,
  getOpenIdClient,
} from '@/server/lib/okta/openid-connect';
import { closeSession } from './api/sessions';

/**
 * @name performAuthorizationCodeFlow
 * @description Helper method to perform the Authorization Code Flow
 *
 * Used for post authentication with the session token to set a session cookie.
 *
 * @param req - the express request object
 * @param res - the express response object
 * @param sessionToken (optional) - if provided, we'll use this to set the session cookie
 * @param confirmationPagePath (optional) - page to redirect the user to after authentication
 * @param idp (optional) - okta id of the social identity provider to use
 * @param closeExistingSession (optional) - if true, we'll close any existing okta session before calling the authorization code flow
 * @returns 303 redirect to the okta /authorize endpoint
 */
export const performAuthorizationCodeFlow = async (
  req: Request,
  res: ResponseWithRequestState,
  {
    sessionToken,
    confirmationPagePath,
    idp,
    closeExistingSession,
  }: {
    sessionToken?: string;
    confirmationPagePath?: RoutePaths;
    idp?: string;
    closeExistingSession?: boolean;
  } = {},
) => {
  if (closeExistingSession) {
    const oktaSessionCookieId: string | undefined = req.cookies.sid;
    // clear existing okta session cookie if it exists
    if (oktaSessionCookieId) {
      await closeSession(oktaSessionCookieId);
    }
  }

  // Determine which OpenIdClient to use, in DEV we use the DevProfileIdClient, otherwise we use the ProfileOpenIdClient
  const OpenIdClient = getOpenIdClient(req);

  // firstly we generate and store a "state"
  // as a http only, secure, signed session cookie
  // which is a json object that contains a stateParam and the query params
  // the stateParam is used to protect against csrf
  const authState = generateAuthorizationState(
    getPersistableQueryParams(res.locals.queryParams),
    confirmationPagePath,
  );
  setAuthorizationStateCookie(authState, res);

  // generate the /authorize endpoint url which we'll redirect the user too
  const authorizeUrl = OpenIdClient.authorizationUrl({
    // Prompt for login if the idp is provided to make sure the user sees
    // the social provider login page
    // Don't prompt for authentication if the idp is not provided (default behaviour)
    prompt: idp ? 'login' : 'none',
    // The sessionToken from authentication to exchange for session cookie
    sessionToken,
    // we send the generated stateParam as the state parameter
    state: authState.stateParam,
    // any scopes, by default the 'openid' scope is required
    // the idapi_token_cookie_exchange scope is checked on IDAPI to return
    // idapi cookies on authentication
    scope: 'openid idapi_token_cookie_exchange',
    // the redirect_uri is the url that we'll redirect the user to after
    redirect_uri: ProfileOpenIdClientRedirectUris.WEB,
    // the identity provider if doing social login
    idp,
  });

  // redirect the user to the /authorize endpoint
  return res.redirect(303, authorizeUrl);
};
