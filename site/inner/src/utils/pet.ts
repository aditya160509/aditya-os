export const PET_SIZE_OPTIONS = [
    { value: 48, label: 'Tiny' },
    { value: 64, label: 'Small' },
    { value: 74, label: 'Classic' },
    { value: 96, label: 'Large' },
    { value: 128, label: 'Huge' },
    { value: 160, label: 'Showcase' },
] as const;

export const DEFAULT_PET_SIZE = 74;

/**
 * Hermes currently ships one official animated character set. These profiles
 * keep that artwork intact while offering a few lightweight presentation
 * choices, so the picker can grow to real sprite packs later without changing
 * the saved preference shape.
 */
export const PET_SPRITE_OPTIONS = [
    { value: 'hermes', label: 'Hermes', note: 'Original palette', filter: 'none', pixelated: false },
    { value: 'amber', label: 'Amber', note: 'Warm terminal tint', filter: 'sepia(.42) saturate(1.28) hue-rotate(326deg)', pixelated: false },
    { value: 'mono', label: 'Mono', note: 'Crisp monochrome', filter: 'grayscale(1) contrast(1.12)', pixelated: false },
    { value: 'pixel', label: 'Pixel', note: 'Hard pixel edges', filter: 'contrast(1.08)', pixelated: true },
] as const;

export type PetSprite = typeof PET_SPRITE_OPTIONS[number]['value'];
export const DEFAULT_PET_SPRITE: PetSprite = 'hermes';

export const clampPetSprite = (value: string): PetSprite => (
    PET_SPRITE_OPTIONS.some((option) => option.value === value)
        ? value as PetSprite
        : DEFAULT_PET_SPRITE
);

export const clampPetSize = (value: number): number => {
    const sizes = PET_SIZE_OPTIONS.map((option) => option.value);
    return sizes.reduce((closest, size) => (
        Math.abs(size - value) < Math.abs(closest - value) ? size : closest
    ), DEFAULT_PET_SIZE);
};
