document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('add-button').addEventListener('click', addOrUpdateNote);
document.getElementById('text-input').addEventListener('input', updateLivePreview);
document.getElementById('fg-input').addEventListener('input', updateLivePreview);
document.getElementById('bg-input').addEventListener('input', updateLivePreview);
document.getElementById('export-button').addEventListener('click', exportConfig);
document.getElementById('import-button').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', importConfig);


// helper function to convert 3-char hex to 6-char hex (normal people shouldn't need this if they didn't mess up the input before)
function expandHex(hex) {
    if (hex && hex.length === 4) {
        return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
}

function updateLivePreview() {
    const text = document.getElementById('text-input').value.trim();
    const fg = document.getElementById('fg-input').value.trim();
    const bg = document.getElementById('bg-input').value.trim();

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
        const defaultFg = '#aa0000';
        const defaultBg = '#ffff77';

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

            const buttonsDiv = document.createElement('div');
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', editNote);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', deleteNote);

            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);

            listItem.appendChild(contentDiv);
            listItem.appendChild(buttonsDiv);

            notesList.appendChild(listItem);
        }

        document.getElementById('fg-input').value = defaultFg;
        document.getElementById('bg-input').value = defaultBg;

        updateLivePreview();
    });
}

function editNote(event) {
    const listItem = event.target.closest('.note-item');
    const symbol = listItem.dataset.symbol;

    chrome.storage.sync.get('notes', (result) => {
        const notes = result.notes || {};
        const noteData = notes[symbol];

        if (noteData) {
            document.getElementById('symbol-input').value = symbol;
            document.getElementById('text-input').value = noteData.text || '';

            const fgValue = expandHex(noteData.fg || '#aa0000');
            const bgValue = expandHex(noteData.bg || '#ffff77');

            document.getElementById('fg-input').value = fgValue;
            document.getElementById('bg-input').value = bgValue;

            updateLivePreview();

            // focus on the first input to make it easy to start editing
            document.getElementById('text-input').focus();
        }
    });
}

function deleteNote(event) {
    const listItem = event.target.closest('.note-item');
    const symbol = listItem.dataset.symbol;
    if (!confirm(`Are you sure you want to delete the note for "${symbol}"?`)) {
        return;
    }

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

    // set colours back to defaults when inputs are cleared
    document.getElementById('fg-input').value = '#aa0000';
    document.getElementById('bg-input').value = '#ffff77';
    updateLivePreview();
}


function exportConfig() {
    chrome.storage.sync.get('notes', (result) => {
        const notes = result.notes || {};
        const dataStr = JSON.stringify(notes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 't212-hover-notes-config.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        setStatus('Config exported!');
    });
}

function importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedNotes = JSON.parse(e.target.result);
            if (typeof importedNotes !== 'object' || importedNotes === null || Array.isArray(importedNotes)) {
                throw new Error('Invalid config format.');
            }

            if (confirm('Import will override all current config. Continue?')) {
                chrome.storage.sync.set({notes: importedNotes}, () => {
                    setStatus('Config imported successfully!');
                    restoreOptions();
                    event.target.value = ''; // Reset file input
                });
            }
        } catch (err) {
            setStatus('Error importing config: ' + err.message);
        }
    };
    reader.readAsText(file);
}
