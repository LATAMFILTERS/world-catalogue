'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * PostHog Analytics Component
 * Initializes PostHog self-driving for user behavior analysis
 * Captures: user registration, navigation, video engagement, conversions
 */
export default function PostHogAnalytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize window.posthog if not already present
    if (!window.posthog) {
      window.posthog = {
        capture: (name: string, properties?: Record<string, unknown>) => {
          if (typeof window !== 'undefined' && window.console) {
            console.log(`[PostHog] ${name}`, properties);
          }
        },
        identify: (userId: string, properties?: Record<string, unknown>) => {
          if (typeof window !== 'undefined' && window.console) {
            console.log(`[PostHog] identify: ${userId}`, properties);
          }
        },
        reset: () => {
          if (typeof window !== 'undefined' && window.console) {
            console.log('[PostHog] reset');
          }
        },
        setPersonProperties: (properties: Record<string, unknown>) => {
          if (typeof window !== 'undefined' && window.console) {
            console.log('[PostHog] setPersonProperties', properties);
          }
        },
      };
    }
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        id="posthog-init"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.PostHogAnalytics=t.PostHog||{},e._i),e.ready=function(t){("undefined"==typeof window?0:window).posthog?window.posthog.register(t):e._i.push([t])},e.onload=function(t){("undefined"==typeof window?0:window).posthog?window.posthog._onload(t):e._i.push([t])},e.capture=function(){e._i.push(["capture"].concat(Array.prototype.slice.call(arguments,0)))},e.identify=function(){e._i.push(["identify"].concat(Array.prototype.slice.call(arguments,0)))},e.reset=function(){e._i.push(["reset"])},e.group=function(){e._i.push(["group"].concat(Array.prototype.slice.call(arguments,0)))},e.page=function(){e._i.push(["page"].concat(Array.prototype.slice.call(arguments,0)))},e.pageview=function(){e._i.push(["pageview"].concat(Array.prototype.slice.call(arguments,0)))},e.register_properties=function(){e._i.push(["register_properties"].concat(Array.prototype.slice.call(arguments,0)))},e.unregister_properties=function(){e._i.push(["unregister_properties"].concat(Array.prototype.slice.call(arguments,0)))},e.opt_in_capturing=function(){e._i.push(["opt_in_capturing"])},e.opt_out_capturing=function(){e._i.push(["opt_out_capturing"])},e.has_opted_in_capturing=function(){return!1},e.has_opted_out_capturing=function(){return!1},e.opt_in_capturing=function(){e._i.push(["opt_in_capturing"])},e.opt_out_capturing=function(){e._i.push(["opt_out_capturing"])},e.has_opted_in_capturing=function(){return!1},e.has_opted_out_capturing=function(){return!1},e.set_config=function(t){e._i.push(["set_config",[t]])},e.reset_config=function(){e._i.push(["reset_config"])},e._i.push(["_setAccount",[i]]),e._i.push(["_setToken",[s]]),e._i.push(["_setAutoCapture",[a.autocapture??true]]),e._i.push(["pageview"]),e._i.push(["sessionRecording",[a.sessionRecording??false]]),e._i.push(["disableSession",[]]));var c="https://eu.i.posthog.com";a.api_host&&(c=a.api_host),a.ignore_dnt||("1"!=navigator.doNotTrack&&"yes"!=navigator.doNotTrack&&"1"==window.doNotTrack||(e.opt_out_capturing()));var u=document.createElement("script");u.defer=!0,u.src=c+"/static/batch/recorder.js";var l=document.getElementsByTagName("script")[0];l.parentNode.insertBefore(u,l)},e._i.push(["init",[t.POSTHOG_KEY||"phc_mock_key",t.POSTHOG_HOST||"https://eu.i.posthog.com",{api_host:t.POSTHOG_HOST||"https://eu.i.posthog.com",autocapture:true,sessionRecording:false}]])),e._i.push(["pageview"]))}(window,window.posthog||[]);
          `,
        }}
      />
    </>
  );
}
