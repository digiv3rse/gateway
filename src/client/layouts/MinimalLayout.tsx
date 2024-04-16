import React from 'react';
import { css } from '@emotion/react';
import MinimalHeader from '../components/MinimalHeader';
import { from, headline, remSpace } from '@guardian/source-foundations';
import useClientState from '../lib/hooks/useClientState';
import {
	ErrorSummary,
	SuccessSummary,
} from '@guardian/source-react-components-development-kitchen';
import locations from '@/shared/lib/locations';
import { Theme } from '../styles/Theme';
import { mainSectionStyles } from '../styles/Shared';
import { DecorativeImageId } from '../assets/decorative';
import { MinimalLayoutImage } from '../components/MinimalLayoutImage';

export interface MinimalLayoutProps {
	children: React.ReactNode;
	pageHeader: string;
	imageId?: DecorativeImageId;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	isJobs?: boolean;
}

const mainStyles = css`
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	max-width: 392px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: ${remSpace[5]};
	${from.desktop} {
		padding: ${remSpace[16]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	}
`;

const pageHeaderStyles = css`
	color: var(--color-heading);
	${headline.small({ fontWeight: 'bold' })};
	margin: 0;
`;

export const MinimalLayout = ({
	children,
	pageHeader,
	imageId,
	successOverride,
	errorOverride,
	errorContext,
	showErrorReportUrl = false,
	isJobs,
}: MinimalLayoutProps) => {
	const clientState = useClientState();
	const { globalMessage: { error, success } = {} } = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;

	return (
		<>
			<Theme />
			<MinimalHeader isJobs={isJobs} />
			<main css={mainStyles}>
				{imageId && <MinimalLayoutImage id={imageId} />}
				{pageHeader && (
					<header>
						<h1 css={pageHeaderStyles}>{pageHeader}</h1>
					</header>
				)}
				<section css={mainSectionStyles}>
					{errorMessage && (
						<ErrorSummary
							message={errorMessage}
							context={errorContext}
							errorReportUrl={
								showErrorReportUrl ? locations.REPORT_ISSUE : undefined
							}
						/>
					)}
					{successMessage && !errorMessage && (
						<SuccessSummary message={successMessage} />
					)}
					{children}
				</section>
			</main>
		</>
	);
};
