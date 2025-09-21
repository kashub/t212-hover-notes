document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('add-button').addEventListener('click', addOrUpdateNote);

// listen for input changes to update the live preview
document.getElementById('text-input').addEventListener('input', updateLivePreview);
document.getElementById('fg-input').addEventListener('input', updateLivePreview);
document.getElementById('bg-input').addEventListener('input', updateLivePreview);

function updateLivePreview() {
    const text = document.getElementById('text-input').value.trim();
    const fg = document.getElementById('fg-input').value.trim() || '#a00';
    const bg = document.getElementById('bg-input').value.trim() || '#ff7';

    const livePreview = document.getElementById('live-preview');

    if (text) {
        livePreview.textContent = text;
        livePreview.style.backgroundColor = bg;
        livePreview.style.color = fg;
        livePreview.style.borderColor = fg;
    } else {
        livePreview.textContent = '';
        livePreview.style.cssText = '';
    }
}

function addOrUpdateNote() {
    const symbol = document.getElementById('symbol-input').value.trim();
    const text = document.getElementById('text-input').value.trim();
    const fg = document.getElementById('fg-input').value.trim();
    const bg = document.getElementById('bg-input').value.trim();

    if (!symbol || !text) {
        setStatus('Error: Symbol and Note Text are required.');
        return;
    }

    const noteData = {text: text};
    if (fg) noteData.fg = fg;
    if (bg) noteData.bg = bg;

    chrome.storage.sync.get('notes', (result) => {
        let notes = result.notes || {};
        notes[symbol] = noteData;

        chrome.storage.sync.set({notes: notes}, () => {
            setStatus('Note saved!');
            restoreOptions();
            clearInputs();
        });
    });
}

function restoreOptions() {
    chrome.storage.sync.get('notes', (result) => {
        const notes = result.notes || {};
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';

        // default colours
        const defaultFg = '#a00';
        const defaultBg = '#ff7';

        for (const symbol in notes) {
            const noteData = notes[symbol];
            const listItem = document.createElement('li');
            listItem.className = 'note-item';
            listItem.dataset.symbol = symbol;

            const fgColour = noteData.fg || defaultFg;
            const bgColour = noteData.bg || defaultBg;

            const notePreview = document.createElement('span');
            notePreview.className = 'note-preview';
            notePreview.textContent = noteData.text;
            notePreview.style.backgroundColor = bgColour;
            notePreview.style.color = fgColour;
            notePreview.style.borderColor = fgColour;
            notePreview.title = `Symbol: ${symbol}\nText: ${noteData.text}\nText Colour: ${fgColour}\nBackground Colour: ${bgColour}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'note-content';

            const symbolStrong = document.createElement('strong');
            symbolStrong.textContent = symbol;

            contentDiv.appendChild(symbolStrong);
            contentDiv.appendChild(notePreview);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', deleteNote);

            listItem.appendChild(contentDiv);
            listItem.appendChild(deleteButton);

            notesList.appendChild(listItem);
        }

        document.getElementById('fg-input').value = defaultFg;
        document.getElementById('bg-input').value = defaultBg;

        updateLivePreview();
    });
}

function deleteNote(event) {
    const listItem = event.target.closest('.note-item');
    const symbol = listItem.dataset.symbol;

    chrome.storage.sync.get('notes', (result) => {
        let notes = result.notes || {};
        delete notes[symbol];

        chrome.storage.sync.set({notes: notes}, () => {
            setStatus('Note deleted!');
            restoreOptions();
        });
    });
}

function setStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    setTimeout(() => {
        status.textContent = '';
    }, 1500);
}

function clearInputs() {
    document.getElementById('symbol-input').value = '';
    document.getElementById('text-input').value = '';
    updateLivePreview();
}