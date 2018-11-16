import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
    selector: 'multi-picker',
    templateUrl: './multi-picker.html',
    styleUrls: ['./multi-picker.scss'],
})
export class MultiPickerComponent implements OnInit {
    @Input('model') model: string[];
    @Input('data') options: (IKeyValuePair<string, string> & ISelectable)[] = [];
    @Input() placeholder: string;
    @Output('modelChange') modelChange = new EventEmitter<string[]>();
    selectedLabel: string;

    ngOnInit(): void {
        if (!this.model) this.model = [];
        this.options.forEach(s => s.selected = this.model.contains(s.value));
        this.afterChanged();
    }

    handleSelection(item: (IKeyValuePair<string, string> & ISelectable), $event: Event) {
        item.selected = !item.selected;
        if (!item.selected)
            this.model.splice(this.model.indexOf(item.value), 1);
        else
            this.model.push(item.value);
        this.afterChanged();
        $event.stopPropagation();
    }

    toggleAll($event: Event) {
        this.model = this.options.map(s => {
            s.selected = true;
            return s.value;
        });
        this.afterChanged();
        $event.stopPropagation();
    }

    toggleNone($event: Event) {
        this.model = [];
        this.options.forEach(state => state.selected = false);
        this.afterChanged();
        $event.stopPropagation();
    }

    private afterChanged() {
        this.selectedLabel = (this.model.length) ? this.model.length + ' selected' : this.placeholder;
        this.modelChange.emit(this.model);
    }
}

