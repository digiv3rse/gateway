import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { space, success, neutral, until } from '@guardian/source-foundations';
import {
  getAutoRow,
  gridItem,
  gridItemColumnConsents,
} from '@/client/styles/Grid';
import { ConsentsContent, controls } from '@/client/layouts/shared/Consents';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsBlueBackground } from '@/client/components/ConsentsBlueBackground';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';
import { Footer } from '@/client/components/Footer';
import {
  greyBorderTop,
  heading,
  text,
  textBold,
} from '@/client/styles/Consents';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import {
  ExternalLink,
  ExternalLinkButton,
} from '@/client/components/ExternalLink';
import { GeoLocation } from '@/shared/model/Geolocation';
import { SvgTickRound } from '@guardian/source-react-components';
import locations from '@/shared/lib/locations';
import { mainStyles } from '@/client/layouts/ConsentsLayout';

type ConsentsConfirmationProps = {
  error?: string;
  success?: string;
  returnUrl: string;
  optedOutOfProfiling: boolean;
  productConsents: Consent[];
  subscribedNewsletters: NewsLetter[];
  geolocation?: GeoLocation;
};

const reviewTableRow = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: ${space[5]}px 0 0;

  &:last-child {
    border: 0;
  }
`;

const reviewTableTextBold = css`
  ${textBold}
  padding-bottom: ${space[2]}px;
`;

const ReviewTableRow: FunctionComponent<{ title: string }> = ({
  title,
  children,
}) => (
  <div css={reviewTableRow}>
    <p css={reviewTableTextBold}>{title}</p>
    {children}
  </div>
);

const continueBoxFlex = css`
  display: flex;
  flex: 1 0 auto;
`;

const sectionStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

const iconStyles = css`
  svg {
    display: block;
    fill: ${success[400]};
    height: 22px;
    width: 22px;
  }
`;

const consentStyles = css`
  display: flex;
  border-top: 1px solid ${neutral[86]};
  padding: ${space[2]}px 0;

  &:last-child {
    border-bottom: 1px solid ${neutral[86]};
  }
`;

const itemText = css`
  margin-left: ${space[2]}px;
`;

const paddingTop = css`
  padding-top: ${space[4]}px;
`;

const marginTop = css`
  margin-top: ${space[4]}px;
`;

const returnButton = css`
  ${until.tablet} {
    width: 100%;
    justify-content: center;
  }
`;

export const ConsentsConfirmation = ({
  error,
  success,
  returnUrl,
  productConsents,
  optedOutOfProfiling,
  subscribedNewsletters,
  geolocation,
}: ConsentsConfirmationProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const anyConsents =
    !optedOutOfProfiling ||
    !!productConsents.length ||
    !!subscribedNewsletters.length;
  return (
    <>
      <ConsentsHeader
        error={error}
        success={success}
        geolocation={geolocation}
      />
      <main css={mainStyles}>
        <ConsentsSubHeader
          autoRow={autoRow}
          title="Your registration is complete"
        />
        <section css={[sectionStyles]}>
          <ConsentsContent>
            <h2 css={[heading, autoRow(), greyBorderTop]}>
              Thank you for completing your registration
            </h2>
            {anyConsents ? (
              <p css={[text, autoRow()]}>
                Please find below a summary of your settings.
              </p>
            ) : (
              <p css={[text, autoRow()]}>
                You now have an account with the Guardian and you can manage
                your preferences and options at anytime under&nbsp;
                <ExternalLink
                  href={locations.MMA_EMAIL_PREFERENCES}
                  subdued={true}
                >
                  Emails &amp; marketing
                </ExternalLink>
                .
              </p>
            )}
            <div css={[autoRow()]}>
              {!!productConsents.length && (
                <ReviewTableRow title="Emails">
                  {productConsents.map((c) => (
                    <div key={c.id} css={consentStyles}>
                      <span css={iconStyles}>
                        <SvgTickRound />
                      </span>
                      <p css={[text, itemText]}>{c.name}</p>
                    </div>
                  ))}
                </ReviewTableRow>
              )}
              {!!subscribedNewsletters.length && (
                <ReviewTableRow title="Newsletters">
                  {subscribedNewsletters.map((n) => (
                    <div key={n.id} css={consentStyles}>
                      <span css={iconStyles}>
                        <SvgTickRound />
                      </span>
                      <p css={[text, itemText]}>{n.name}</p>
                    </div>
                  ))}
                </ReviewTableRow>
              )}
              {!optedOutOfProfiling && (
                <ReviewTableRow title="Data">
                  <div css={consentStyles}>
                    <span css={iconStyles}>
                      <SvgTickRound />
                    </span>
                    <p css={[text, itemText]}>
                      Allow analysis of my data for marketing
                    </p>
                  </div>
                </ReviewTableRow>
              )}
            </div>
            {anyConsents && (
              <p css={[text, paddingTop, autoRow()]}>
                You can change these anytime in your account under&nbsp;
                <ExternalLink
                  href={locations.MMA_EMAIL_PREFERENCES}
                  subdued={true}
                >
                  Emails &amp; marketing
                </ExternalLink>
                .
              </p>
            )}
            {!subscribedNewsletters.length && (
              <>
                <h2 css={[heading, autoRow(), greyBorderTop, marginTop]}>
                  Guardian newsletters
                </h2>
                <p css={[text, autoRow()]}>Didn’t find anything you like?</p>
                <p css={[text, autoRow()]}>
                  We have over&nbsp;
                  <ExternalLink
                    href={locations.MMA_EMAIL_PREFERENCES}
                    subdued={true}
                  >
                    40 different newsletters
                  </ExternalLink>
                  &nbsp;that focus on a range of diverse topics - from politics
                  to the latest tech documentaries, sport and scientific
                  breakthroughs.
                </p>
              </>
            )}
          </ConsentsContent>
          <ConsentsBlueBackground cssOverrides={continueBoxFlex}>
            <div css={[controls, gridItem(gridItemColumnConsents)]}>
              <ExternalLinkButton
                iconSide="right"
                href={returnUrl}
                cssOverrides={returnButton}
              >
                Return to the Guardian
              </ExternalLinkButton>
            </div>
          </ConsentsBlueBackground>
        </section>
      </main>
      <Footer />
    </>
  );
};
