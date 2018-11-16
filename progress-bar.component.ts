import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'progress-bar',
    templateUrl: "./progress-bar.component.html",
    styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent {
    @Input() amount: number = 0;
    @Input() max: number = 100;
    @Input() customPercent: number = 0;
    color = "black"; // if black shows something isn't wired up right

    ngOnChanges() {
        if (this.max && this.amount) {
            this.color = this.getColor(this.customPercent != 0 ? this.customPercent : this.amount / this.max);
        }
    }

    getColor(percent: number) {
        return (percent >= 0.9) ? "#4aa033" : (percent < 0.7) ? "#ab3434" : "#f8b400";
    }

}
