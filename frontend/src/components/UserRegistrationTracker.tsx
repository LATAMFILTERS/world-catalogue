'use client';

import { useEffect, useCallback } from 'react';

/**
 * User Registration Tracker Component
 * Monitors and reports user registration flow events to PostHog
 * Events: registration_started, registration_step_completed, registration_error, registration_success
 */
export default function UserRegistrationTracker() {
  const trackRegistrationEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      if (typeof window === 'undefined') return;

      // Track in PostHog
      if (window.posthog?.capture) {
        window.posthog.capture(eventName, {
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          ...properties,
        });
      }

      // Track in GA4
      if (window.gtag) {
        window.gtag('event', eventName, {
          page_path: window.location.pathname,
          ...properties,
        });
      }

      // Console log for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Registration Tracker] ${eventName}:`, {
          page: window.location.pathname,
          ...properties,
          timestamp: new Date().toISOString(),
        });
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track when user enters the app/registration page
    trackRegistrationEvent('user_entry', {
      entry_point: window.location.pathname,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
    });

    // Track form interaction
    const handleFormInteraction = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formName = form?.name || form?.id || 'unnamed_form';

      if (event.type === 'focus') {
        trackRegistrationEvent('registration_field_focused', {
          form_name: formName,
          field_name: (event.target as HTMLElement)?.id || 'unknown',
        });
      }

      if (event.type === 'change') {
        const input = event.target as HTMLInputElement;
        trackRegistrationEvent('registration_field_changed', {
          form_name: formName,
          field_name: input?.name || input?.id || 'unknown',
          field_type: input?.type || 'unknown',
        });
      }
    };

    // Track form submission attempts
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formName = form?.name || form?.id || 'unnamed_form';

      trackRegistrationEvent('registration_form_submitted', {
        form_name: formName,
        form_action: form?.action || window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    };

    // Track form errors
    const handleFormError = (event: Event) => {
      const element = event.target as HTMLElement;
      trackRegistrationEvent('registration_error_detected', {
        element_id: element?.id || 'unknown',
        element_type: element?.tagName || 'unknown',
        error_message: element?.textContent || 'unknown',
      });
    };

    // Attach listeners to all forms on the page
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.addEventListener('focus', handleFormInteraction);
        input.addEventListener('change', handleFormInteraction);
        input.addEventListener('blur', handleFormInteraction);
      });
      form.addEventListener('submit', handleFormSubmit);
    });

    // Track validation errors
    const errorElements = document.querySelectorAll('[role="alert"], .error, .form-error');
    errorElements.forEach((element) => {
      element.addEventListener('appeared', handleFormError);
    });

    // Monitor for successful registrations via API calls
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);

      // Check if this is a registration API call
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (
        response.ok &&
        (url.includes('/register') ||
          url.includes('/signup') ||
          url.includes('/user/create') ||
          url.includes('/auth/register'))
      ) {
        trackRegistrationEvent('registration_success', {
          api_endpoint: url,
          response_status: response.status,
        });

        // Extract user data if available
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          if (data.userId || data.id) {
            trackRegistrationEvent('user_created', {
              user_id: data.userId || data.id,
              email: data.email || 'unknown',
            });
          }
        } catch {
          // Response may not be JSON
        }
      }

      return response;
    };

    // Cleanup
    return () => {
      forms.forEach((form) => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((input) => {
          input.removeEventListener('focus', handleFormInteraction);
          input.removeEventListener('change', handleFormInteraction);
          input.removeEventListener('blur', handleFormInteraction);
        });
        form.removeEventListener('submit', handleFormSubmit);
      });

      errorElements.forEach((element) => {
        element.removeEventListener('appeared', handleFormError);
      });

      window.fetch = originalFetch;
    };
  }, [trackRegistrationEvent]);

  return null;
}
