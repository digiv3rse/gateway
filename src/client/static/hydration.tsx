import React from 'react';
import { record } from '@/client/lib/ophan';
import { ABProvider } from '@guardian/ab-react';
import { hydrate } from 'react-dom';
import { RoutingConfig } from '@/client/routes';
import { App } from '@/client/app';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import {
  BrowserClient,
  Breadcrumbs,
  Dedupe,
  defaultStackParser,
  getCurrentHub,
  GlobalHandlers,
  makeFetchTransport,
  HttpContext,
} from '@sentry/browser';

type Props = {
  routingConfig: RoutingConfig;
};

export const hydrateApp = ({ routingConfig }: Props) => {
  const clientState = routingConfig.clientState;

  const {
    abTesting: { mvtId = 0, forcedTestVariants = {} } = {},
    sentryConfig: { stage, build, dsn },
  } = clientState;

  if (dsn) {
    const client = new BrowserClient({
      dsn,
      environment: stage,
      release: `gateway@${build}`,
      sampleRate: 0.2,
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      integrations: [
        new Breadcrumbs(),
        new GlobalHandlers(),
        new Dedupe(),
        new HttpContext(),
      ],
    });

    getCurrentHub().bindClient(client);
  }

  hydrate(
    <ABProvider
      arrayOfTestObjects={tests}
      abTestSwitches={abSwitches}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={mvtId}
      ophanRecord={record}
      forcedTestVariants={forcedTestVariants}
    >
      <App {...clientState} location={routingConfig.location} />
    </ABProvider>,
    document.getElementById('app'),
  );
};
