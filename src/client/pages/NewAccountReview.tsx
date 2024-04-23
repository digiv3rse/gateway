import React, { createRef, useEffect } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Consent } from '@/shared/model/Consent';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { Button } from '@guardian/source-react-components';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { QueryParams } from '@/shared/model/QueryParams';
import { consentsFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { primaryButtonStyles } from '../styles/Shared';
import { remSpace, textSans } from '@guardian/source-foundations';
import { css } from '@emotion/react';
import { ToggleSwitchList } from '../components/ToggleSwitchList';

const subheadingStyles = css`
	${textSans.small({ fontWeight: 'bold' })};
	margin-top: ${remSpace[3]};
	margin-bottom: ${remSpace[1]};
	color: var(--color-heading);
`;

const listStyles = css`
	margin-top: 0;
	padding-left: ${remSpace[8]};
`;

const buttonStyles = css`
	margin-top: ${remSpace[3]};
`;

const stickyFooterStyles = css`
	position: sticky;
	bottom: -2px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	z-index: 20;
	padding: 0.75rem 0;

	> button {
		max-width: 392px;
	}
`;

const stickyFooterWrapperStyles = css`
	display: none;
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 4.25rem;
	background-color: var(--color-background);
	z-index: 10;

	&.stuck {
		display: block;
		box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.1);
	}
`;

export interface NewAccountReviewProps {
	profiling?: Consent;
	advertising?: Consent;
	queryParams: QueryParams;
	hasCmpConsent: boolean;
}

export const NewAccountReview = ({
	profiling,
	advertising,
	queryParams,
	hasCmpConsent,
}: NewAccountReviewProps) => {
	const stickyFooterRef = createRef<HTMLDivElement>();
	const stickyFooterWrapperRef = createRef<HTMLDivElement>();
	useEffect(() => {
		if (!stickyFooterRef.current || !stickyFooterWrapperRef.current) {
			return;
		}
		const observer = new IntersectionObserver(
			([e]) => {
				e.target.classList.toggle('stuck', e.intersectionRatio < 1);
				stickyFooterWrapperRef.current?.classList.toggle(
					'stuck',
					e.intersectionRatio < 1,
				);
			},
			{ threshold: [1] },
		);
		observer.observe(stickyFooterRef.current as Element);
		return () => observer.disconnect();
	}, [stickyFooterRef, stickyFooterWrapperRef]);

	if (!profiling && !advertising) {
		return (
			<MinimalLayout
				pageHeader="You're signed in! Welcome to the Guardian."
				imageId="welcome"
			>
				<form
					action={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
					method="post"
				>
					<CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />
					<CsrfFormField />
					<Button css={primaryButtonStyles} type="submit" priority="primary">
						Continue to the Guardian
					</Button>
				</form>
			</MinimalLayout>
		);
	}
	return (
		<MinimalLayout
			pageHeader="You're signed in! Welcome to the Guardian."
			imageId="welcome"
		>
			<MainBodyText>
				Before you start, confirm how you’d like the Guardian to use your
				signed-in data.
			</MainBodyText>
			<form
				action={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
				method="post"
				onSubmit={({ target: form }) => {
					consentsFormSubmitOphanTracking(
						form as HTMLFormElement,
						[profiling, advertising].filter(Boolean) as Consent[],
					);
				}}
			>
				<CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />
				<CsrfFormField />
				<ToggleSwitchList>
					{!!advertising && (
						<ToggleSwitchInput
							id={advertising.id}
							description="Allow personalised advertising with my signed-in data"
							defaultChecked={advertising.consented ?? false}
						/>
					)}
					{!!profiling && (
						<ToggleSwitchInput
							id={profiling.id}
							description="Allow the Guardian to analyse my signed-in data to improve marketing content"
							defaultChecked={profiling.consented ?? true} // legitimate interests so defaults to true
						/>
					)}
				</ToggleSwitchList>
				{!!advertising && (
					<>
						<MainBodyText cssOverrides={subheadingStyles}>
							Personalised advertising
						</MainBodyText>
						<MainBodyText>
							Advertising is a crucial source of our funding. You won’t see more
							ads, and your data won’t be shared with third parties to use for
							their own advertising. Instead, we would analyse your information
							to predict what you might be interested in.
						</MainBodyText>
					</>
				)}
				<MainBodyText cssOverrides={subheadingStyles}>
					What we mean by signed-in data
				</MainBodyText>
				<MainBodyText>
					<ul css={listStyles}>
						<li>Information you provide e.g. email address</li>
						<li>Products or services you buy from us</li>
						<li>
							Pages you view on theguardian.com or other Guardian websites when
							signed in
						</li>
					</ul>
				</MainBodyText>
				<InformationBox>
					<InformationBoxText>
						You can change your settings under{' '}
						<ExternalLink href={locations.MMA_DATA_PRIVACY}>
							Data Privacy
						</ExternalLink>{' '}
						on your Guardian account at any time.
					</InformationBoxText>
				</InformationBox>
				<div css={stickyFooterStyles} ref={stickyFooterRef}>
					<Button
						css={[primaryButtonStyles, buttonStyles]}
						type="submit"
						priority="primary"
					>
						Save and continue
					</Button>
				</div>
				<div css={stickyFooterWrapperStyles} ref={stickyFooterWrapperRef}></div>
			</form>
		</MinimalLayout>
	);
};
