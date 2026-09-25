import { PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel, SurfaceNotation } from './odontogram';
import { Language } from './i18n/translations';
import { NumberingSystem } from './utils/numbering';
import { OdontogramThemeConfig } from './theme';
import { OdontogramPlugin } from './plugin';
type __VLS_Props = {
    language?: Language;
    numberingSystem?: NumberingSystem;
    darkMode?: boolean;
    themeConfig?: OdontogramThemeConfig;
    plugins?: OdontogramPlugin[];
    readOnly?: boolean;
    enableNotes?: boolean;
    enableIcdas?: boolean;
    pulpDetailLevel?: PulpDetailLevel;
    secondaryCariesMode?: SecondaryCariesMode;
    rootCariesMode?: RootCariesMode;
    radiographicDepthMode?: RadiographicDepthMode;
    cariesDepthEnabled?: boolean;
    wearDetailLevel?: ToothDetailLevel;
    discolorationDetailLevel?: ToothDetailLevel;
    surfaceNotation?: SurfaceNotation;
    showStatusCard?: boolean;
    showOrthoCard?: boolean;
    /** شناسه بیمار فعلی — برای ذخیره‌سازی رکوردها */
    patientId?: string;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    languageChange: (lang: Language) => any;
    numberingChange: (system: NumberingSystem) => any;
    darkModeChange: (dark: boolean) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onLanguageChange?: (lang: Language) => any;
    onNumberingChange?: (system: NumberingSystem) => any;
    onDarkModeChange?: (dark: boolean) => any;
}>, {
    patientId: string;
    language: Language;
    numberingSystem: NumberingSystem;
    readOnly: boolean;
    enableNotes: boolean;
    enableIcdas: boolean;
    pulpDetailLevel: PulpDetailLevel;
    secondaryCariesMode: SecondaryCariesMode;
    rootCariesMode: RootCariesMode;
    radiographicDepthMode: RadiographicDepthMode;
    cariesDepthEnabled: boolean;
    wearDetailLevel: ToothDetailLevel;
    discolorationDetailLevel: ToothDetailLevel;
    surfaceNotation: SurfaceNotation;
    showStatusCard: boolean;
    showOrthoCard: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
