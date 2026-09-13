import { FlagCtx } from './types';
interface Deps {
    setActive: (el: any, on: boolean) => void;
    svgGetById: (root: any, id: string) => any;
    isToothPresent: (sel: string) => boolean;
    isUnderGum: (sel: string) => boolean;
    isExtraction: (sel: string) => boolean;
    fissureAllowedTeeth: Set<number>;
    brokenVariants: Set<string>;
}
/** Compute the render's derived booleans (mirrors applyStateToSvgSingle). */
export declare function buildFlagCtx(state: any, toothNo: number, d: Deps): FlagCtx;
/** Activate the in-scope boolean-flag layers + the mods set layers. Order-independent. */
export declare function applyFlagLayers(svg: any, state: any, ctx: FlagCtx, d: Deps): void;
export {};
