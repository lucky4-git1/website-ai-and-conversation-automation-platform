(function () {
  'use strict';

  // Prevent multiple instantiations
  if (window.ApexAIWidgetLoaded) return;
  window.ApexAIWidgetLoaded = true;

  // Retrieve script configuration
  var scriptTag = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var siteId = scriptTag ? scriptTag.getAttribute('data-site-id') || 'site_apex_live_01' : 'site_apex_live_01';
  var host = scriptTag ? (new URL(scriptTag.src)).origin : window.location.origin;

  // Create widget container
  var container = document.createElement('div');
  container.id = 'apex-ai-widget-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'flex-end';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Create Iframe for isolated styling
  var iframe = document.createElement('iframe');
  iframe.id = 'apex-ai-widget-iframe';
  iframe.src = host + '/widget?siteId=' + encodeURIComponent(siteId);
  iframe.style.width = '400px';
  iframe.style.height = '620px';
  iframe.style.maxHeight = 'calc(100vh - 100px)';
  iframe.style.maxWidth = 'calc(100vw - 40px)';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '16px';
  iframe.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  iframe.style.display = 'none';
  iframe.style.marginBottom = '12px';
  iframe.style.transition = 'all 0.25s ease-in-out';
  iframe.allow = 'camera; microphone; autoplay';

  // Create Launcher Button
  var button = document.createElement('button');
  button.id = 'apex-ai-widget-launcher';
  button.setAttribute('aria-label', 'Open AI & Live Support Chat');
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#0284c7';
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.4)';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'transform 0.2s, background-color 0.2s';

  button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var isOpen = false;

  button.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.style.display = 'block';
      button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      button.style.backgroundColor = '#475569';
    } else {
      iframe.style.display = 'none';
      button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      button.style.backgroundColor = '#0284c7';
    }
  });

  // Listen for close message from iframe
  window.addEventListener('message', function (event) {
    if (event.data === 'apex-ai-close-widget') {
      isOpen = false;
      iframe.style.display = 'none';
      button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      button.style.backgroundColor = '#0284c7';
    }
  });

  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);
})();
