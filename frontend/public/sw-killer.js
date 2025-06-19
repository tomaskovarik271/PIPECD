// Service Worker Killer - Aggressively remove all service workers
(function() {
  'use strict';
  
  console.log('🚫 Service Worker Killer: Removing all service workers...');
  
  if ('serviceWorker' in navigator) {
    // Get all registrations and unregister them
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        console.log('🗑️ Unregistering service worker:', registration.scope);
        registration.unregister().then(function(success) {
          if (success) {
            console.log('✅ Service worker unregistered successfully');
          } else {
            console.log('❌ Failed to unregister service worker');
          }
        });
      }
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
          return Promise.all(
            cacheNames.map(function(cacheName) {
              console.log('🗑️ Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }).then(function() {
          console.log('✅ All caches cleared');
        });
      }
    });
    
    // Block any future service worker registrations
    const originalRegister = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function() {
      console.warn('🚫 Blocked service worker registration attempt');
      return Promise.reject(new Error('Service workers are disabled'));
    };
  }
  
  // Block workbox
  if (window.workbox) {
    console.log('🚫 Blocking workbox');
    window.workbox = undefined;
  }
  
  console.log('✅ Service Worker Killer: Complete');
})(); 