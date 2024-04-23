import React from 'react';
import { from, palette, remSpace } from '@guardian/source-foundations';
import { css } from '@emotion/react';
import { SvgGuardianLogo } from '@guardian/source-react-components';
import jobsLogo from '@/client/assets/jobs/jobs-logo.png';

const headerStyles = css`
	border-bottom: 1px solid ${palette.neutral[46]};
	padding: ${remSpace[4]} ${remSpace[4]} ${remSpace[2]} ${remSpace[5]};
	display: flex;
	justify-content: flex-end;
`;

const logoStyles = css`
	height: 2rem;
	display: flex;
	svg {
		fill: var(--color-logo);
		height: 100%;
	}
	${from.desktop} {
		height: 3.5rem;
	}
`;

const jobsLogoStyles = css`
	height: 2rem;
	display: flex;
	${from.desktop} {
		height: 3.5rem;
	}
`;

const JobsLogo = () => (
	<img src={jobsLogo} alt="The Guardian Jobs logo" css={jobsLogoStyles} />
);

interface Props {
	isJobs?: boolean;
}

export default function MinimalHeader({ isJobs }: Props) {
	return (
		<header css={headerStyles}>
			<div css={logoStyles}>{isJobs ? <JobsLogo /> : <SvgGuardianLogo />}</div>
		</header>
	);
}
