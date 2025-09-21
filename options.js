document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-button').addEventListener('click', saveOptions);

function saveOptions() {
    const notesInput = document.getElementById('notes-input').value;
    try {
        const notes = JSON.parse(notesInput);
        chrome.storage.sync.set({notes: notes}, () => {
            const status = document.getElementById('status');
            status.textContent = 'Options saved!';
            setTimeout(() => {
                status.textContent = '';
            }, 750);
        });
    } catch (e) {
        const status = document.getElementById('status');
        status.textContent = 'Error: Invalid JSON format.';
    }
}

function restoreOptions() {
    chrome.storage.sync.get({notes: {}}, (items) => {
        document.getElementById('notes-input').value = JSON.stringify(items.notes, null, 2);
    });
}
