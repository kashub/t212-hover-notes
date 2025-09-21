document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('add-button').addEventListener('click', addOrUpdateNote);

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

            listItem.innerHTML = `
                <div class="note-content">
                    <strong>${symbol}</strong>
                    <span>${noteData.text}</span>
                    <span style="color:${fgColour};">FG: ${fgColour}</span>
                    <span style="color:${bgColour};">BG: ${bgColour}</span>
                </div>
                <div>
                    <button class="delete-button">Delete</button>
                </div>
            `;
            notesList.appendChild(listItem);
        }

        // add listeners to new delete buttons
        notesList.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', deleteNote);
        });

        // pre-fill the inputs with default colours
        document.getElementById('fg-input').value = defaultFg;
        document.getElementById('bg-input').value = defaultBg;
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
    // keep colours pre-filled
    // document.getElementById('fg-input').value = '#a00';
    // document.getElementById('bg-input').value = '#ff7';
}
