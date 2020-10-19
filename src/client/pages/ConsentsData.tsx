import React, { useContext } from 'react';
import Locations from '@/client/lib/locations';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { space, neutral } from '@guardian/src-foundations';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text, headingMarginSpace6 } from '@/client/styles/Consents';
import { GlobalState } from '@/shared/model/GlobalState';
import { Consents } from '@/shared/model/Consent';
import { Link } from '@guardian/src-link';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[6]}px 0 0 0;
  ${textSans.medium()}
`;

const checkboxLabel = css`
  color: ${neutral[46]};
`;

export const ConsentsDataPage = () => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  const globalState = useContext<GlobalState>(GlobalStateContext);

  const { pageData = {} } = globalState;
  const { consents = [] } = pageData;

  const profiling_optout = consents.find(
    (consent) => consent.id === Consents.PROFILING,
  );

  const label = (
    <span css={checkboxLabel}>{profiling_optout?.description}</span>
  );

  return (
    <ConsentsLayout title="Your data" current={CONSENTS_PAGES.YOUR_DATA}>
      {profiling_optout && (
        <>
          <h3 css={[heading, autoRow()]}>Our commitment to you</h3>
          <p css={[text, autoRow()]}>
            We think carefully about our use of personal data and use it
            responsibly. We never share it without your permission and we have a
            team who are dedicated to keeping any data we collect safe and
            secure. You can find out more about how The Guardian aims to
            safeguard users data by going to the{' '}
            <Link
              href={Locations.PRIVACY}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </Link>{' '}
            section of the website.
          </p>
          <h3 css={[heading, headingMarginSpace6, autoRow()]}>
            Using your data for marketing analysis
          </h3>
          <p css={[text, autoRow()]}>
            From time to time we may use your personal data for marketing
            analysis. That includes looking at what products or services you
            have bought from us and what pages you have been viewing on
            theguardian.com and other Guardian websites (e.g. Guardian Jobs or
            Guardian Holidays). We do this to understand your interests and
            preferences so that we can make our marketing communication more
            relevant to you.
          </p>
          <fieldset css={[fieldset, autoRow()]}>
            <CheckboxGroup name={profiling_optout.id}>
              <Checkbox
                value="consent-option"
                label={label}
                defaultChecked={profiling_optout.consented}
              />
            </CheckboxGroup>
          </fieldset>
        </>
      )}
    </ConsentsLayout>
  );
};
