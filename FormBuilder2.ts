import { FormBuilder, ValidatorFn, AsyncValidatorFn, FormGroup } from "@angular/forms";

export declare interface FormBuilder2 extends FormBuilder {
    group<T>(
        controlsConfig: {
            [K in keyof T]?: {
                0: T[K];
                1?: ValidatorFn | ValidatorFn[] | null;
                2?: AsyncValidatorFn | AsyncValidatorFn[] | null;
            };
        },
        extra?: {
            validator: ValidatorFn;
            [key: string]: any;
        } | null
    ): FormGroup;
}
