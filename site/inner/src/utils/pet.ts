export const PET_SIZE_OPTIONS = [
    { value: 48, label: 'Tiny' },
    { value: 64, label: 'Small' },
    { value: 74, label: 'Classic' },
    { value: 96, label: 'Large' },
    { value: 128, label: 'Huge' },
    { value: 160, label: 'Showcase' },
] as const;

export const DEFAULT_PET_SIZE = 74;

export const clampPetSize = (value: number): number => {
    const sizes = PET_SIZE_OPTIONS.map((option) => option.value);
    return sizes.reduce((closest, size) => (
        Math.abs(size - value) < Math.abs(closest - value) ? size : closest
    ), DEFAULT_PET_SIZE);
};
