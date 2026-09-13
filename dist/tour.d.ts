export interface TourStep {
    selector: string;
    titleKey: string;
    textKey: string;
}
export declare const TOUR_STEPS: TourStep[];
export declare function clampStep(i: number): number;
/** Start the 12-step interactive intro tour. */
export declare function startIntroTour(): void;
