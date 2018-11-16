import { Directive, Input, ElementRef } from '@angular/core';

@Directive({
    selector: '[flex]',
})
export class FlexRowChildDirective {
    static regex = /flex-start|flex-end|start|end|text|center|baseline|stretch|top|bottom/gi;
    @Input() flex = "";

    constructor(private el: ElementRef) {
    }

    ngOnChanges() {
        let val = this.flex;
        let keyword = val.match(FlexRowChildDirective.regex);
        let alignSelf = keyword ? ReverseAlignSelf[keyword[0]] : null;
        if (alignSelf) {
            this.el.nativeElement.style["align-self"] = alignSelf;
            val = val.replace(FlexRowChildDirective.regex, "").trim();
        }
        if (val !== "")
            this.el.nativeElement.style.flex = val;
    }
}

enum ReverseAlignSelf {
    "top" = "flex-start",
    "flex-start" = "flex-start",
    "start" = "flex-start",
    "end" = "flex-end",
    "flex-end" = "flex-end",
    "bottom" = "flex-end",
    "center" = "center",
    "baseline" = "baseline",
    "text" = "baseline",
    "stretch" = "stretch",
}