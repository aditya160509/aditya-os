// Tiny UI sound player. Sounds ship in public/audio/ui (copied from the
// outer 3D shell's mouse/keyboard/startup set). Honors Settings prefs.
const cache: Record<string, HTMLAudioElement> = {};

export function playUiSound(name: 'open' | 'close' | 'minimize' | 'key' | 'shutdown') {
    try {
        if (localStorage.getItem('soundOn') === '0') return;
        const file =
            name === 'open'
                ? 'audio/ui/mouse_down.mp3'
                : name === 'close'
                  ? 'audio/ui/mouse_up.mp3'
                  : name === 'shutdown'
                    ? 'audio/ui/startup.mp3'
                    : name === 'key'
                      ? 'audio/ui/key_1.mp3'
                      : 'audio/ui/key_2.mp3';
        cache[file] =
            cache[file] || new Audio(file);
        cache[file].volume = Number(localStorage.getItem('volume') || '0.7');
        cache[file].currentTime = 0;
        cache[file].play().catch(() => {});
    } catch {
        /* audio unavailable — stay silent */
    }
}
