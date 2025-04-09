
// // Check if the browser supports service workers
// if ('serviceWorker' in navigator) {
//     // Register the service worker
//     navigator.serviceWorker.register('/static/pwa/sw.js')
//         .then(registration => {
//             console.log('Service Worker registered with scope:', registration.scope);
//         })
//         .catch(error => {
//             console.error('Service Worker registration failed:', error);
//         });

//     // Listen for the beforeinstallprompt event
//     window.addEventListener('beforeinstallprompt', (event) => {
//         // Prevent the default install prompt
//         event.preventDefault();
        
//         // Show the custom install button
//         document.getElementById('installButton').removeAttribute("hidden");
        
//         // Store the event to trigger the install prompt later
//         deferredInstallPrompt = event;
//     });

//     // Example install button click event
//     document.getElementById('installButton').addEventListener('click', () => {
//         // Trigger the install prompt
//         deferredInstallPrompt.prompt();

//         // Wait for the user to respond to the prompt
//         deferredInstallPrompt.userChoice
//             .then((choiceResult) => {
//                 if (choiceResult.outcome === 'accepted') {
//                     console.log('User accepted the install prompt');
//                 } else {
//                     console.log('User dismissed the install prompt');
//                 }

//                 // Reset the deferred prompt variable
//                 deferredInstallPrompt = null;
//             });
//     });
// }

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/pwa/sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}