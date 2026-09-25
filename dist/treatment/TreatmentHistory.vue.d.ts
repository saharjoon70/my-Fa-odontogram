import { OdontogramRecord, RecordKind } from './treatmentStore';
type __VLS_Props = {
    records: OdontogramRecord[];
    /** فیلتر بر اساس نوع (اختیاری) */
    filterKind?: RecordKind;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    remove: (id: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onRemove?: (id: string) => any;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
