import * as React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button, buttonReaderRevenue } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-svgs';
import { css } from '@emotion/core';
import { space, brandAlt } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { ThemeProvider } from 'emotion-theming';

const textInput = css`
  margin-bottom: ${space[3]}px;
`;

const header = css`
  background-color: ${brandAlt[400]};
  padding: ${space[2]}px ${space[3]}px;
`;

const main = css`
  padding: ${space[3]}px ${space[3]}px;
`;

const p = css`
  margin: 0;
  ${textSans.medium({ fontWeight: 'bold', lineHeight: 'regular' })}
`;

const form = css`
  padding: ${space[2]}px 0px;
`;

export const ResetPasswordPage = () => (
  <>
    <div css={header}>
      <p css={p}>Forgotten or need to set your password?</p>
    </div>
    <div css={main}>
      <p css={p}>We will email you a link to reset it.</p>
      <form css={form} method="post" action="/reset">
        <TextInput
          css={textInput}
          label="Email address"
          name="email"
          type="email"
        />
        <ThemeProvider theme={buttonReaderRevenue}>
          <Button
            type="submit"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Reset Password
          </Button>
        </ThemeProvider>
      </form>
    </div>
  </>
);
