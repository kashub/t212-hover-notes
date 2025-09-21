(function() {
    'use strict';

    const style = `
    #t212-tooltip {
      position: fixed;
      display: none;
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
      padding: 6px;
      border-radius: 8px;
      transition: opacity 0.2s ease-in-out;
      font-size: 16px;
      font-family: monospace;
      line-height: 0.9em;
      border: 1px dotted black;
    }
  `;

    const styleElement = document.createElement('style');
    styleElement.textContent = style;
    document.head.appendChild(styleElement);

    const defaultFg = '#a00';
    const defaultBg = '#ff7';

    const keep = { text: 'KEEP', bg: '#294', fg: '#fff' };

    const notes = {
        'BARCl_EQ': keep,
        'EYEl_EQ': { text: 'Go sell @ £306.7+'},
        'VHYLl_EQ': keep,
        'VUSAl_EQ': keep,
        'PHNXl_EQ': keep,
        'SEDYl_EQ': keep,
        'SAPd_EQ': {text: 'Auto sell @ €253.00'},
        'QWTMl_EQ': {text: 'See how it goes over time'},
        'FB_US_EQ': {text: 'Sell as soon as there is some profit', bg: '#f00', 'fg': '#ff0'},

        'FAKE': {text: 'just some test fake one with different background and foreground colours', bg: '#f1c40f', fg: '#000'}
    };

    const tooltip = document.createElement('div');
    tooltip.id = 't212-tooltip';
    document.body.appendChild(tooltip);

    function handleEvent(event) {
        const row = event.target.closest('div[data-testid="eq-portfolio-tab-investment-item"]');

        if (row && event.type === 'mouseover') {
            const inst = row.querySelector('[data-testid^="eq-investment-item-instrument-"]');
            if (!inst) return;

            const key = inst.getAttribute('data-testid').replace('eq-investment-item-instrument-', '');

            // Use a default note if the key is not found to show the key name
            const noteData = notes[key] || { text: 'Key: ' + key, bg: '#eee', fg: '#666' };

            if (noteData.text) {
                tooltip.textContent = noteData.text;
                const fgColour = noteData.fg || defaultFg;
                tooltip.style.backgroundColor = noteData.bg || defaultBg;
                tooltip.style.color = fgColour;
                tooltip.style.borderColor = fgColour;

                tooltip.style.display = 'block';
                tooltip.style.left = `${event.clientX + 15}px`;
                tooltip.style.top = `${event.clientY + 15}px`;
            } else {
                tooltip.style.display = 'none';
            }
        } else if (event.type === 'mouseout') {
            tooltip.style.display = 'none';
        }
    }

    document.body.addEventListener('mouseover', handleEvent);
    document.body.addEventListener('mouseout', handleEvent);
})();
