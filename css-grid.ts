import { Component, Input, SimpleChanges, HostBinding, Directive, ElementRef, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
    selector: 'css-grid',
    template: '<ng-content></ng-content>',
    styles: [':host{display:grid;display:-ms-grid;} :host > * {grid-area:1/1}'],
})
export class CssGridComponent {
    @Input('grid-template') template: string = "auto / auto";
    @Input('gap') gap: string;
    @Input('column-gap') colGap: string;
    @Input('row-gap') rowGap: string;

    @HostBinding('style.grid-gap') gridGap: string;
    @HostBinding('style.grid-column-gap') gridColumnGap: string;
    @HostBinding('style.grid-row-gap') gridRowGap: string;
    @HostBinding('style.grid-template-columns') gridColumns: string
    @HostBinding('style.grid-template-rows') gridRows: string;
    @HostBinding('style.-ms-grid-columns') gridColumnsMS: string;
    @HostBinding('style.-ms-grid-rows') gridRowsMS: string;

    ngOnChanges(changes: SimpleChanges) {
        this.rowGap = this.rowGap || this.gap || "0px";
        this.colGap = this.colGap || this.gap || "0px";

        this.gridColumnGap = this.colGap;
        this.gridRowGap = this.rowGap;

        let values = this.template.split('/').map(s => s.trim());
        this.gridColumns = values[1] || 'auto';
        this.gridRows = values[0] || 'auto';
        this.gridColumnsMS = this.gridColumns.split(' ').join(' ' + this.gridColumnGap + ' ');
        this.gridRowsMS = this.gridRows.split(' ').join(' ' + this.gridRowGap + ' ');
    }

}

@Directive({ selector: '[grid-area]' })
export class CssGridGridAreaDirective {
    @Input('grid-area') area: string; // grid-row-start / grid-column-start / grid-row-end / grid-column-end

    @HostBinding('style.grid-area') gridArea: SafeStyle;
    @HostBinding('style.-ms-grid-row') gridRowMS: number;
    @HostBinding('style.-ms-grid-column') gridColumnMS: number;
    @HostBinding('style.-ms-grid-row-span') gridRowSpanMS: number;
    @HostBinding('style.-ms-grid-column-span') gridColumnSpanMS: number;

    constructor(private el: ElementRef, private sanitizer: DomSanitizer) {
    }

    ngAfterViewInit() {
        let element = this.el.nativeElement as HTMLElement;
        if (window.getComputedStyle(element).getPropertyValue('display') == 'inline')
            element.style.display = 'block'; // for IE and Edge 
    }

    ngOnChanges() {
        if (!this.area) return;

        let values = this.area.split('/').map(s => parseInt(s.trim()));
        if (!values[1]) values[1] = values[0];
        if (!values[2]) values[2] = 1;
        if (!values[3]) values[3] = values[2];
        this.gridArea = this.sanitizer.bypassSecurityTrustStyle(this.area);

        let toIEIndex = (n: number) => n + (n - 1);

        this.gridRowMS = toIEIndex(values[0]);
        this.gridColumnMS = toIEIndex(values[1]);
        this.gridRowSpanMS = toIEIndex(values[2]) - this.gridRowMS;
        this.gridColumnSpanMS = toIEIndex(values[3]) - this.gridColumnMS;
    }
}

@Directive({ selector: '[place-self]', })
export class CssGridPlaceSelfDirective {
    @Input('place-self') placeSelf: string;

    @HostBinding('style.justify-self') horizontal: PlaceSelf;
    @HostBinding('style.align-self') vertical: PlaceSelf;
    @HostBinding('style.-ms-grid-row-align') horizontalMS: PlaceSelf;
    @HostBinding('style.-ms-grid-column-align') verticalMS: PlaceSelf;

    ngOnChanges() {
        if (this.placeSelf) {
            let val = this.placeSelf.split(' ');//as PlaceSelf[];
            this.vertical = this.verticalMS = !val[0] ? "auto" : PlaceSelf[val[0]] ? PlaceSelf[val[0]] : val[0];
            this.horizontal = this.horizontalMS = !val[1] ? this.vertical : PlaceSelf[val[1]] ? PlaceSelf[val[1]] : val[1];
        }
    }

}


enum PlaceSelf {
    "auto" = "auto",

    "start" = "start",
    "end" = "end",
    "center" = "center",
    "stretch" = "stretch",

    "full" = "stretch",

    "left" = "start",
    "right" = "end",

    "top" = "start",
    "bottom" = "end",
}

