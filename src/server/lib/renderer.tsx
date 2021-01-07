import { ClientState } from '@/shared/model/ClientState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Main } from '@/client/main';
import { brandBackground } from '@guardian/src-foundations/palette';
import qs from 'query-string';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { RoutingConfig } from '@/client/routes';
import { getAssets } from '@/server/lib/getAssets';
import { RequestState } from '@/server/models/Express';
import { FieldError } from '@/server/routes/changePassword';
import { CsrfErrors } from '@/shared/model/Errors';
import { ABProvider } from '@guardian/ab-react';
import { tests } from '@/shared/model/experiments/abTests';
import { switches } from '@/shared/model/experiments/abSwitches';

const assets = getAssets();

// favicon shamefully stolen from dcr
const favicon =
  process.env.NODE_ENV === 'production'
    ? 'favicon-32x32.ico'
    : 'favicon-32x32-dev-yellow.ico';

interface RendererOpts {
  pageTitle: string;
  requestState: RequestState;
}

const { gaUID } = getConfiguration();

const clientStateFromRequestStateLocals = ({
  csrf,
  globalMessage,
  pageData,
  queryParams,
  abTesting,
  clientHosts,
}: RequestState): ClientState => {
  const clientState: ClientState = {
    csrf,
    globalMessage,
    pageData,
    abTesting,
    clientHosts,
  };

  // checking if csrf error exists in query params, and attaching it to the
  // forms field errors
  if (queryParams.csrfError) {
    // global state page data will already exist at this point
    // this is just a check to get typescript to compile
    const fieldErrors: Array<FieldError> =
      clientState.pageData?.fieldErrors ?? [];
    fieldErrors.push({
      field: 'csrf',
      message: CsrfErrors.CSRF_ERROR,
    });
    return {
      ...clientState,
      pageData: {
        ...clientState.pageData,
        fieldErrors,
      },
    };
  } else {
    return clientState;
  }
};

export const renderer: (url: string, opts: RendererOpts) => string = (
  url,
  { requestState, pageTitle },
) => {
  const context = {};

  const clientState = clientStateFromRequestStateLocals(requestState);

  const queryString = qs.stringify(requestState.queryParams);

  const location = `${url}${queryString ? `?${queryString}` : ''}`;

  const {
    abTesting: { mvtId = 0, forcedTestVariants = {} } = {},
  } = clientState;

  // Any changes made here must also be made to the hydration in the static webpack bundle
  const react = ReactDOMServer.renderToString(
    <ABProvider
      arrayOfTestObjects={tests}
      abTestSwitches={switches}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={mvtId}
      forcedTestVariants={forcedTestVariants}
    >
      <StaticRouter location={location} context={context}>
        <Main {...clientState}></Main>
      </StaticRouter>
    </ABProvider>,
  );

  const routingConfig: RoutingConfig = {
    clientState,
    location,
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset='utf-8' />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="${brandBackground.primary}" />
        <link rel="icon" href="https://static.guim.co.uk/images/${favicon}">
        <title>${pageTitle} | The Guardian</title>
        <script>window.gaUID = "${gaUID.id}"</script>
        <script src="/${assets.runtime}" defer></script>
        <script src="/${assets.vendors}" defer></script>
        <script src="/${assets.main}" defer></script>
        <script id="routingConfig" type="application/json">${JSON.stringify(
          routingConfig,
        )}</script>
      </head>
      <body style="margin:0">
        <div id="app">${react}</div>
      </body>
    </html>
  `;
};
