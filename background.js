chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.notes) {
        chrome.tabs.query({url: "*://*.trading212.com/*"}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "updateNotes",
                    notes: changes.notes.newValue
                });
            });
        });
    }
});
