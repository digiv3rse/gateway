import { ClientState, FieldError } from '@/shared/model/ClientState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { App } from '@/client/app';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { RoutingConfig } from '@/shared/model/RoutingConfig';
import { RequestState } from '@/server/models/Express';
import { CaptchaErrors, CsrfErrors } from '@/shared/model/Errors';
import { ABProvider } from '@guardian/ab-react';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import { buildUrlWithQueryParams, PathParams } from '@/shared/lib/routeUtils';
import { brandBackground, resets } from '@guardian/source-foundations';
import deepmerge from 'deepmerge';
import { RoutePaths } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import serialize from 'serialize-javascript';
import Bowser from 'bowser';
import { ChunkExtractor } from '@loadable/server';
import path from 'path';

// This is the stats file generated by webpack loadable plugin
const statsFile = `${path.resolve(__dirname, 'static')}/loadable-stats.json`;
const legacyStatsFile = `${path.resolve(
  __dirname,
  'static',
)}/legacy.loadable-stats.json`;

// favicon shamefully stolen from dcr
const favicon =
  process.env.NODE_ENV === 'production'
    ? 'favicon-32x32.ico'
    : 'favicon-32x32-dev-yellow.ico';

interface RendererOpts {
  pageTitle: PageTitle;
  requestState: RequestState;
}

const { gaUID } = getConfiguration();

// for safari 10 and 11 although they support modules, we want then to use the legacy bundle
// as the modern bundle is not compatible with these browser versions
const isSafari10Or11 = (browser: Bowser.Parser.Details): boolean =>
  browser.name === 'Safari' &&
  (!!browser.version?.includes('10.') || !!browser.version?.includes('11.'));

const getScriptTags = (
  isSafari10Or11: boolean,
  modernChunkExtractor: ChunkExtractor,
  legacyChunkExtractor: ChunkExtractor,
): string => {
  if (isSafari10Or11) {
    return legacyChunkExtractor.getScriptTags();
  }
  return `
    ${modernChunkExtractor.getScriptTags({ type: 'module' })}

    ${
      // we need to remove the first line lines of the script tags as they are
      // already included through the modern chunk extractor
      legacyChunkExtractor
        .getScriptTags({ nomodule: '' })
        .split('\n')
        .slice(1)
        .join('\n')
    }
  `;
};

const clientStateFromRequestStateLocals = ({
  csrf,
  globalMessage,
  pageData,
  queryParams,
  abTesting,
  clientHosts,
  recaptchaConfig,
  sentryConfig,
}: RequestState): ClientState => {
  const clientState: ClientState = {
    csrf,
    globalMessage,
    pageData,
    abTesting,
    clientHosts,
    recaptchaConfig,
    queryParams,
    sentryConfig,
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
  }

  // checking if recaptcha error exists in query params, and attaching it to the
  // forms field errors
  if (queryParams.recaptchaError) {
    return deepmerge(clientState, {
      globalMessage: {
        error: CaptchaErrors.GENERIC,
      },
    });
  }

  return clientState;
};

export const renderer: <P extends RoutePaths>(
  url: P,
  opts: RendererOpts,
  tokenisationParams?: PathParams<P>,
) => string = (url, { requestState, pageTitle }, tokenisationParams) => {
  const clientState = clientStateFromRequestStateLocals(requestState);

  const location = buildUrlWithQueryParams(
    url,
    tokenisationParams,
    requestState.queryParams,
  );

  const { abTesting: { mvtId = 0, forcedTestVariants = {} } = {} } =
    clientState;

  // We create an extractor from the statsFile
  const extractor = new ChunkExtractor({
    statsFile,
    publicPath: '/gateway-static',
  });
  const legacyExtractor = new ChunkExtractor({
    statsFile: legacyStatsFile,
    publicPath: '/gateway-static',
  });

  // Wrap your application using "collectChunks"
  const jsx = extractor.collectChunks(
    // Any changes made here must also be made to the hydration in the static webpack bundle
    <ABProvider
      arrayOfTestObjects={tests}
      abTestSwitches={abSwitches}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={mvtId}
      forcedTestVariants={forcedTestVariants}
    >
      <StaticRouter location={location}>
        <App {...clientState}></App>
      </StaticRouter>
    </ABProvider>,
  );

  // Render your application
  const html = ReactDOMServer.renderToString(jsx);

  const scriptTags = getScriptTags(
    isSafari10Or11(requestState.browser),
    extractor,
    legacyExtractor,
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

        <script src="https://assets.guim.co.uk/polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017%2Ces2018%2Ces2019%2Ces2020%2Ces2021%2Cfetch%2CglobalThis%2CNodeList.prototype.forEach%2CURLSearchParams" defer></script>

        ${scriptTags}

        <script id="routingConfig" type="application/json">${serialize(
          routingConfig,
          { isJSON: true },
        )}</script>
        <style>${resets.defaults}</style>
      </head>
      <body style="margin:0">
        <div id="app">${html}</div>
      </body>
    </html>
  `;
};
