type Range = [number, number]

export type Group = Range[]

export type GroupKey = "space" | "tabulation" | "lineBreaks" | "otherSpaces" | "invisible"

export const CHAR_GROUPS: Record<GroupKey, Group> = {
    space: [[0x20, 0x20]],
    tabulation: [[0x09, 0x09]],
    lineBreaks: [[0x0A, 0x0A], [0x0D, 0x0D]],
    otherSpaces: [
        [0x0B, 0x0C], [0x85, 0x85], [0xA0, 0xA0], [0x1680, 0x1680], [0x2000, 0x200A],
        [0x2028, 0x2029], [0x202F, 0x202F], [0x205F, 0x205F], [0x3000, 0x3000],
    ],
    invisible: [
        [0x180E, 0x180E], [0x200B, 0x200D], [0x2060, 0x2060], [0xFEFF, 0xFEFF],
    ],
};