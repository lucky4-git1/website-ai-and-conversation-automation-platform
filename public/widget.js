(function () {
  'use strict';

  if (window.SpeakForMeWidgetLoaded) return;
  window.SpeakForMeWidgetLoaded = true;

  var scriptTag = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var siteId = scriptTag ? scriptTag.getAttribute('data-site-id') || 'site_speakforme_01' : 'site_speakforme_01';
  var host = scriptTag ? (new URL(scriptTag.src)).origin : window.location.origin;

  // Widget container
  var container = document.createElement('div');
  container.id = 'speakforme-widget-container';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'flex-end';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Iframe for strict CSS & security isolation
  var iframe = document.createElement('iframe');
  iframe.id = 'speakforme-widget-iframe';
  iframe.src = host + '/widget?siteId=' + encodeURIComponent(siteId);
  iframe.style.width = '410px';
  iframe.style.height = '640px';
  iframe.style.maxHeight = 'calc(100vh - 110px)';
  iframe.style.maxWidth = 'calc(100vw - 36px)';
  iframe.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  iframe.style.borderRadius = '20px';
  iframe.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)';
  iframe.style.display = 'none';
  iframe.style.marginBottom = '14px';
  iframe.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out';
  iframe.allow = 'camera; microphone; autoplay';

  // Tactile Launcher Button
  var button = document.createElement('button');
  button.id = 'speakforme-widget-launcher';
  button.setAttribute('aria-label', 'Open SpeakForMe AI Assistant');
  button.style.width = '58px';
  button.style.height = '58px';
  button.style.borderRadius = '18px';
  button.style.backgroundColor = '#6366f1'; // Electric Iris
  button.style.color = '#ffffff';
  button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 10px 25px -4px rgba(99, 102, 241, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s, box-shadow 0.2s';

  button.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var isOpen = false;

  button.addEventListener('mouseenter', function() {
    button.style.transform = 'translateY(-2px) scale(1.02)';
  });
  button.addEventListener('mouseleave', function() {
    button.style.transform = 'translateY(0) scale(1)';
  });
  button.addEventListener('mousedown', function() {
    button.style.transform = 'scale(0.94)';
  });
  button.addEventListener('mouseup', function() {
    button.style.transform = 'translateY(-2px) scale(1.02)';
  });

  button.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.style.display = 'block';
      button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      button.style.backgroundColor = '#18181b';
      button.style.boxShadow = '0 8px 16px -4px rgba(0,0,0,0.3)';
    } else {
      iframe.style.display = 'none';
      button.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      button.style.backgroundColor = '#6366f1';
      button.style.boxShadow = '0 10px 25px -4px rgba(99, 102, 241, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)';
    }
  });

  window.addEventListener('message', function (event) {
    if (event.data === 'apex-ai-close-widget' || event.data === 'speakforme-close-widget') {
      isOpen = false;
      iframe.style.display = 'none';
      button.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      button.style.backgroundColor = '#6366f1';
      button.style.boxShadow = '0 10px 25px -4px rgba(99, 102, 241, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)';
    }
  });

  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);
})();
