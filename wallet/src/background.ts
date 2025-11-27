// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Ease Wallet installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SIGN_TRANSACTION') {
        // Handle transaction signing
        handleSignTransaction(request.data)
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep channel open for async response
    }
});

async function handleSignTransaction(data: any) {
    // Transaction signing logic would go here
    return { success: true };
}

export { };
