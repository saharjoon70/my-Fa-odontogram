import { StatusItem, StatusRadio } from './statusGroups';
/** فیلدهای state در odontogram.ts که UI به آن‌ها دسترسی دارد */
export type ToothStateField = "toothSelection" | "toothSubstrate" | "restorationType" | "restorationMaterial" | "prosthesis" | "endo" | "endoResection" | "pulpDx" | "pulpLatin" | "apicalDx" | "periapicalType" | "resorptionType" | "periImplant" | "mobility" | "caries" | "cariesSeverity" | "cariesActiveDepth" | "rootCaries" | "radiographicDepth" | "fillingMaterial" | "fillingSurfaces" | "fillingSurfaceMaterials" | "fillingDefect" | "fissureSealing" | "calculus" | "contactMesial" | "contactDistal" | "wearEdge" | "wearCervical" | "discoloration" | "orthoAppliance" | "orthoDrift" | "orthoVertical" | "orthoRotation" | "brokenMesial" | "brokenIncisal" | "brokenDistal" | "crownLeakage" | "crownReplace" | "crownNeeded" | "extractionPlan" | "extractionWound" | "missingClosed" | "bridgePillar" | "parapulpalPin" | "mods" | "customStates" | "cariesSeverityUI" | (string & {});
/** شکل patch که به setToothStateAndRender فرستاده می‌شود */
export type StatePatch = Record<string, unknown>;
/**
 * یک آیتم checkbox را به patch تبدیل می‌کند.
 *
 * @param item آیتم وضعیت
 * @param checked وضعیت جدید checkbox
 * @returns patch یا null اگر فیلد خاصی نداشت
 */
export declare function statusItemToPatch(item: StatusItem, checked: boolean): StatePatch | null;
/**
 * یک radio را به patch تبدیل می‌کند.
 */
export declare function statusRadioToPatch(radio: StatusRadio, value: string): StatePatch | null;
/**
 * از روی مقادیر فعلی state، وضعیت checkbox یک آیتم را مشخص می‌کند.
 */
export declare function isItemChecked(item: StatusItem, state: Record<string, unknown>): boolean;
/**
 * مقدار فعلی یک radio را برمی‌گرداند.
 */
export declare function getRadioValue(radio: StatusRadio, state: Record<string, unknown>): string;
