type __VLS_Props = {
    patientId: string;
    toothNo: number;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    cancel: () => any;
    submit: (payload: {
        treatmentId: string;
        treatmentLabel: string;
        category: string;
        surface?: string;
        material?: string;
        price: number;
        status: "done" | "planned";
        note: string;
    }) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onCancel?: () => any;
    onSubmit?: (payload: {
        treatmentId: string;
        treatmentLabel: string;
        category: string;
        surface?: string;
        material?: string;
        price: number;
        status: "done" | "planned";
        note: string;
    }) => any;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
