import { Component, Input, SimpleChanges, HostBinding } from '@angular/core';

@Component({
    selector: 'flex-row',
    template: '<ng-content></ng-content>',
})
export class FlexRowComponent {
    // user sets wrap/nowrap AND justify-content at the same time
    @Input() nowrap = FlexJustifyContent.start; // nowrap is default
    @Input() wrap: FlexJustifyContent = null;
    @Input() wrapUpward: FlexJustifyContent = null;
    // end set wrap&jc
    @Input() vertical = FlexAlignItems.stretch;
    @Input() multipleRows = FlexAlignContent.stretch;
    @Input() rightToLeft = false;
    @HostBinding('style.display') readonly display = "flex";
    @HostBinding('style.flex-flow') flexFlow = 'row nowrap';
    @HostBinding('style.justify-content') justifyContent = FlexJustifyContent[this.nowrap];
    @HostBinding('style.align-content') alignContent = FlexAlignContent[this.multipleRows];
    @HostBinding('style.align-items') alignItems = FlexAlignItems[this.vertical];

    ngOnChanges(changes: SimpleChanges) {
        this.flexFlow = (this.rightToLeft ? "row-reverse" : "row") + " " + (this.wrapUpward ? "wrap-reverse" : this.wrap ? "wrap" : "nowrap");
        let justifyContentValueUsed = (this.wrapUpward || this.wrap || this.nowrap);
        this.justifyContent = FlexJustifyContent[justifyContentValueUsed];
        this.alignContent = FlexAlignContent[this.multipleRows];
        this.alignItems = FlexAlignItems[this.vertical];

        // the rest is error reporting
        let propertyUsed = this.wrapUpward ? "wrapUpward" : this.wrap ? "wrap" : "nowrap";
        if (((this.wrap && this.wrapUpward)) || ((this.wrap || this.wrapUpward) && this.nowrap !== FlexJustifyContent.start))
            console.error("<flex-row> should use only one of the properties nowrap, wrap, wrapUpward");
        if (!this.wrap && !this.wrapUpward && this.multipleRows != FlexAlignContent.stretch)
            console.error("<flex-row> multipleRows is meaningless with nowrap");
        if (!this.alignItems)
            console.error('"' + this.vertical + '" is invalid for <flex-row vertical="' + this.vertical + '"> --  top bottom center stretch text');
        if (!this.justifyContent)
            console.error('"' + justifyContentValueUsed + '" is invalid for <flex-row ' + propertyUsed + '="' + justifyContentValueUsed + `">
    xxx..	start   flex-start  left
	..xxx	end     flex-end    right
	.xxx.	center
	x.x.x	between space-between
	.x.x.	around  space-around`);
        if (!this.alignContent)
            console.error('"' + this.multipleRows + '" is invalid for <flex-row multipleRows="' + this.multipleRows + `">
    xxx..	start   flex-start  left
	..xxx	end     flex-end    right
	.xxx.	center
	XXX     stretch
	x.x.x	between space-between
	.x.x.	around  space-around`);
    }

}

// distribute space on the main axis (the horizontal axis, for flex-row)
enum FlexJustifyContent {
    "xxx.." = "flex-start", // default
    "..xxx" = "flex-end",
    ".xxx." = "center",
    "x.x.x" = "space-between",
    ".x.x." = "space-around",
    "xx..." = "flex-start",
    "...xx" = "flex-end",
    "..x.." = "center",
    "x.." = "flex-start",
    "..x" = "flex-end",
    ".x." = "center",
    "flex-start" = "flex-start",
    "flex-end" = "flex-end",
    "center" = "center",
    "space-between" = "space-between",
    "space-around" = "space-around",
    "start" = "flex-start",
    "end" = "flex-end",
    "left" = "flex-start",
    "right" = "flex-end",
    "between" = "space-between",
    "around" = "space-around",
}

// distribute space on the cross axis (the vertical axis, for flex-row)
enum FlexAlignItems {
    top = "flex-start",
    bottom = "flex-end",
    center = "center",
    stretch = "stretch",  // default
    text = "baseline",
}

// distribute space among multiple rows (only used when items wrap onto additional rows)
enum FlexAlignContent {
    "xxx.." = "flex-start",
    "..xxx" = "flex-end",
    ".xxx." = "center",
    "x.x.x" = "space-between",
    ".x.x." = "space-around",
    "xx..." = "flex-start",
    "...xx" = "flex-end",
    "..x.." = "center",
    "x.." = "flex-start",
    "..x" = "flex-end",
    ".x." = "center",
    "XXX" = "stretch",  // default
    "flex-start" = "flex-start",
    "flex-end" = "flex-end",
    "center" = "center",
    "space-between" = "space-between",
    "space-around" = "space-around",
    "start" = "flex-start",
    "end" = "flex-end",
    "stretch" = "stretch",
    "between" = "space-between",
    "around" = "space-around",
}
