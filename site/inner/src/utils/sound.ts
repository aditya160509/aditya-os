// Tiny UI sound player. Sounds ship in the outer shell's canonical /audio
// folder. The inner public copy remains available for standalone development;
// staging removes that duplicate from the deploy output.
const cache: Record<string, HTMLAudioElement> = {};

export function playUiSound(name: 'open' | 'close' | 'minimize' | 'key' | 'shutdown') {
    try {
        if (localStorage.getItem('soundOn') === '0') return;
        const file =
            name === 'open'
                ? '/audio/mouse/mouse_down.mp3'
                : name === 'close'
                  ? '/audio/mouse/mouse_up.mp3'
                  : name === 'shutdown'
                    ? '/audio/startup/startup.mp3'
                    : name === 'key'
                      ? '/audio/keyboard/key_1.mp3'
                      : '/audio/keyboard/key_2.mp3';
        cache[file] =
            cache[file] || new Audio(file);
        cache[file].volume = Number(localStorage.getItem('volume') || '0.7');
        cache[file].currentTime = 0;
        cache[file].play().catch(() => {});
    } catch {
        /* audio unavailable — stay silent */
    }
}
