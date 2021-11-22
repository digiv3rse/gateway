import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { from, space, brand, border } from '@guardian/source-foundations';
import {
  getAutoRow,
  gridItem,
  gridItemColumnConsents,
  SpanDefinition,
} from '@/client/styles/Grid';
import {
  ConsentsContent,
  controls,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsBlueBackground } from '@/client/components/ConsentsBlueBackground';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';
import { Footer } from '@/client/components/Footer';
import { headingWithMq, text } from '@/client/styles/Consents';
import { SvgArrowRightStraight } from '@guardian/source-react-components';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import {
  ExternalLink,
  ExternalLinkButton,
} from '@/client/components/ExternalLink';

type ConsentsConfirmationProps = {
  error?: string;
  success?: string;
  returnUrl: string;
  optedOutOfProfiling: boolean;
  optedOutOfMarketResearch: boolean;
  productConsents: Consent[];
  subscribedNewsletters: NewsLetter[];
};
const reviewTableContainer = css`
  display: flex;
  flex-flow: column;
  margin-top: ${space[6]}px;
  border: 1px solid ${border.secondary};
`;

const mainBackground = css`
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    background-color: ${brand[400]};
    opacity: 0.8;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`;

const reviewTableRow = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-bottom: 1px solid ${border.secondary};
  padding: ${space[5]}px;

  ${from.tablet} {
    flex-direction: row;
  }

  &:last-child {
    border: 0;
  }
`;

const reviewTableCell = css`
  flex: 1 1 auto;

  ${from.tablet} {
    flex: 1 1 0px;
  }
`;

const reviewTableTextBold = css`
  ${text}
  font-weight: bold;
  padding-bottom: ${space[2]}px;

  ${from.tablet} {
    padding-bottom: 0;
  }
`;

const ReviewTableRow: FunctionComponent<{ title: string }> = ({
  title,
  children,
}) => (
  <div css={reviewTableRow}>
    <div css={reviewTableCell}>
      <p css={reviewTableTextBold}>{title}:</p>
    </div>
    <div css={reviewTableCell}>{children}</div>
  </div>
);

const newslettersBox = css`
  flex: 1 0 auto;
  align-content: flex-start;
  padding-bottom: ${space[24]}px;
`;

const continueBoxFlex = css`
  flex: 0 0 auto;
`;

const confirmationSpanDefinition: SpanDefinition = {
  TABLET: {
    start: 2,
    span: 9,
  },
  DESKTOP: {
    start: 2,
    span: 8,
  },
  LEFT_COL: {
    start: 2,
    span: 8,
  },
  WIDE: {
    start: 3,
    span: 10,
  },
};

const bgColour = css`
  &:before {
    background-color: ${CONSENTS_MAIN_COLOR};
    opacity: 0.4;
  }
`;

const sectionStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

export const ConsentsConfirmation = ({
  error,
  success,
  returnUrl,
  optedOutOfProfiling,
  optedOutOfMarketResearch,
  productConsents,
  subscribedNewsletters,
}: ConsentsConfirmationProps) => {
  const autoRow = getAutoRow(1, confirmationSpanDefinition);
  return (
    <>
      <ConsentsHeader error={error} success={success} />
      <main>
        <ConsentsSubHeader
          autoRow={autoRow}
          title="Your registration is complete"
        />
        <section css={[mainBackground, sectionStyles, bgColour]}>
          <ConsentsContent>
            <h2 css={[headingWithMq, autoRow()]}>Your selections</h2>
            <p css={[text, autoRow()]}>
              You can change these setting anytime by going to{' '}
              <ExternalLink
                href="https://manage.theguardian.com/email-prefs"
                subdued={true}
              >
                My Preferences
              </ExternalLink>
              .
            </p>
            <div css={[reviewTableContainer, autoRow()]}>
              <ReviewTableRow title="Newsletters">
                {subscribedNewsletters.length ? (
                  subscribedNewsletters.map((n) => (
                    <p key={n.id} css={text}>
                      {n.name}
                    </p>
                  ))
                ) : (
                  <p css={text}>N/A</p>
                )}
              </ReviewTableRow>
              <ReviewTableRow title="Products & services">
                {productConsents.length ? (
                  productConsents.map((c) => (
                    <p key={c.id} css={text}>
                      {c.name}
                    </p>
                  ))
                ) : (
                  <p css={text}>N/A</p>
                )}
              </ReviewTableRow>
              <ReviewTableRow title="Marketing research">
                <p css={text}>{optedOutOfMarketResearch ? 'No' : 'Yes'}</p>
              </ReviewTableRow>
              <ReviewTableRow title="Marketing analysis">
                <p css={text}>{optedOutOfProfiling ? 'No' : 'Yes'}</p>
              </ReviewTableRow>
            </div>
          </ConsentsContent>
          <ConsentsBlueBackground cssOverrides={continueBoxFlex}>
            <div css={[gridItem(gridItemColumnConsents), controls]}>
              <ExternalLinkButton
                iconSide="right"
                nudgeIcon={true}
                icon={<SvgArrowRightStraight />}
                href={returnUrl}
              >
                Return to the Guardian
              </ExternalLinkButton>
            </div>
          </ConsentsBlueBackground>
          <ConsentsContent cssOverrides={newslettersBox}>
            <h2 css={[headingWithMq, autoRow()]}>
              Sign up to more newsletters
            </h2>
            <p css={[text, autoRow()]}>
              We have over 40 different emails that focus on a range of diverse
              topics - from politics and the latest tech to documentaries, sport
              and scientific breakthroughs. Sign up to more in{' '}
              <ExternalLink
                href="https://manage.theguardian.com/email-prefs"
                subdued={true}
              >
                Guardian newsletters
              </ExternalLink>
              .
            </p>
          </ConsentsContent>
        </section>
      </main>
      <Footer />
    </>
  );
};
