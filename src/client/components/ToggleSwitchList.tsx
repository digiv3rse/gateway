import { css } from '@emotion/react';
import { remSpace } from '@guardian/source-foundations';
import React, { PropsWithChildren } from 'react';

const containerStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${remSpace[3]};
`;

export const ToggleSwitchList = ({ children }: PropsWithChildren) => {
	return <div css={containerStyles}>{children}</div>;
};
