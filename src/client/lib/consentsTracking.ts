import { PageData } from '@/shared/model/ClientState';
import { Newsletters } from '@/shared/model/Newsletter';
import { sendOphanInteractionEvent } from './ophan';

const trackInputElementInteraction = (
  inputElem: HTMLInputElement,
  component: string,
  consentName: string,
): void => {
  if (inputElem.type === 'checkbox') {
    sendOphanInteractionEvent({
      component: `identity-onboarding-${component}`,
      value: `${consentName} : ${inputElem.checked}`,
    });
  }

  if (inputElem.type === 'radio' && inputElem.checked) {
    sendOphanInteractionEvent({
      component: `identity-onboarding-${component}`,
      value: `${consentName} : ${inputElem.value}`,
    });
  }
};

// handle consents form submit event
const consentsFormSubmitOphanTracking = (
  inputElems: NodeListOf<HTMLInputElement>,
  pageData: PageData,
): void => {
  const consents = pageData.consents;

  if (consents) {
    inputElems.forEach((elem) => {
      const consent = consents.find(({ id }) => id === elem.name);

      if (consent) {
        trackInputElementInteraction(elem, 'consent', consent.name);
      }
    });
  }
};

// handle newsletter form submit event
const newslettersFormSubmitOphanTracking = (
  inputElems: NodeListOf<HTMLInputElement>,
  pageData: PageData,
): void => {
  const newsletters = pageData.newsletters;

  if (newsletters) {
    inputElems.forEach((elem) => {
      const newsletter = newsletters.find(({ id }) => id === elem.name);

      if (newsletter) {
        // if previously subscribed AND now wants to unsubscribe
        // OR if previously not subscribed AND wants to subscribe
        // then do the trackInputElementInteraction
        if (
          (newsletter.subscribed && !elem.checked) ||
          (!newsletter.subscribed && elem.checked)
        ) {
          trackInputElementInteraction(elem, 'newsletter', newsletter.nameId);
        }
      }
    });
  }

  // @AB_TEST: Default Weekly Newsletter Test: required for tracking
  inputElems.forEach((elem) => {
    const defaultWeeklyNewsletter =
      elem.name === Newsletters.SATURDAY_ROUNDUP_TRIAL;
    if (defaultWeeklyNewsletter) {
      trackInputElementInteraction(
        elem,
        'newsletter',
        'saturday-roundup-trial',
      );
    }
  });
};

// handle generic form (direct to one of the two below based on page)
export const onboardingFormSubmitOphanTracking = (
  page: string,
  pageData: PageData,
  target: HTMLFormElement,
): void => {
  const inputElems = target.querySelectorAll('input');

  // we add a starting slash to the page, to match the route enums
  switch (`/${page}`) {
    case '/communication':
    case '/data':
    case '/signin/success':
      return consentsFormSubmitOphanTracking(inputElems, pageData);
    case '/newsletters':
      return newslettersFormSubmitOphanTracking(inputElems, pageData);
    default:
      return;
  }
};
