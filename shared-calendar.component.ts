import { Component, Input, ViewChild, SimpleChanges, Output, EventEmitter, ContentChild, TemplateRef, ElementRef, OnInit } from '@angular/core';
import * as moment from "moment";
import * as ng2dnd from "ng2-dnd";
import { Dictionary } from '../../../vppcore/reportanalyzer/interfaces/uiModels';

export interface ICalendarItem {
    id: any;
    start: moment.Moment;
    invisible: boolean;
}

const msPerDay = 86400000;

interface NthDaySinceEpoch extends Number { }

export class MoreClick {
    constructor(public date: moment.Moment) { }
}

export class DayClick {
    constructor(public date: moment.Moment, public view: ViewObject) { }
}

export class DropOnDay<T = any> {
    constructor(public date: moment.Moment, public id: T, public jsEvent: MouseEvent, public revertFunc: () => void) { }
}

export class ViewObject {
    constructor(public intervalStart: moment.Moment, public intervalEnd: moment.Moment, public numDaysToShow: number, public date: moment.Moment) { }
}

@Component({
    selector: 'shared-calendar',
    templateUrl: './shared-calendar.component.html',
    styleUrls: ['./shared-calendar.component.scss'],
})
export class SharedCalendarComponent  {
  
    static daysOfWeek = [0, 1, 2, 3, 4, 5, 6].map(i => moment().startOf('week').add(i, 'day').format('ddd'));

    @Input('items') items: ICalendarItem[] = [];
    @Input() count = 0; // items.length, to trigger Angular change detection
    @Input() filter: Dictionary<any>; // Angular change detection tells us when to re-check item.invisible
    @Input('numDaysToShow') numDaysToShow = 28;
    @ContentChild(TemplateRef) itemLabelTemplate: TemplateRef<any>;
    @Output("datesChanged") onDatesChanged = new EventEmitter<ViewObject>();
    @Output() dayClick = new EventEmitter<DayClick>();
    @Output() itemClick = new EventEmitter<ICalendarItem>();
    @Output() moreClick = new EventEmitter<MoreClick>();
    @Output() dropExisting = new EventEmitter<DropOnDay>();
    @Output() dropNew = new EventEmitter<DropOnDay>();

    // used from HTML
    weeks = [0, 1, 2, 3]; // #/items == #/weeks
    days = SharedCalendarComponent.daysOfWeek;
    events: { numMoreItems: number, items: ICalendarItem[] }[/* the Nth day since epoch */] = [];
    dayOfMonth: Dictionary<number> = {};
    todayCSS: NthDaySinceEpoch = this.toEpoch(moment().add(moment().utcOffset(), "minute")); // local not utc
    viewStart: NthDaySinceEpoch;
    intervalStart: moment.Moment;
    intervalEnd: moment.Moment;

    private centralDayUTC: moment.Moment = moment().utc();
    private eventLimit = 30;
    private viewInited = false;

    constructor(private el: ElementRef) {
        this.datesChanged(false); // don't emit a change event until after ngAfterViewInit
    }

    ngAfterViewInit() {
         this.calculateEventLimit();
    }

      


    ngOnChanges(changes: SimpleChanges) {
        if (!this.viewInited) return;
        if (changes['items'] || changes['count'] || changes['filter']) this.itemsChanged();
        if (changes['moment'] || changes['numDaysToShow']) this.datesChanged();
    }

    private calculateEventLimit() {
        let eachDayDiv = <HTMLDivElement>(<HTMLElement>this.el.nativeElement).getElementsByClassName('each-day')[0];
        if (eachDayDiv.clientHeight > 0)
            this.eventLimit = Math.floor(eachDayDiv.clientHeight / 16) - 1; // the -1 is because items don't appear beside/under the date display 
    }

    initiateCalendar(){
        this.itemsChanged();
        this.onDatesChanged.emit(this.getViewObject()); 
        this.viewInited = true;
    }

    // break up long list of events into multiple arrays, indexed by the Nth day of the epoch
    private itemsChanged() {
        this.events = [];
        for (var event of (this.items || [])) {
            if (event.invisible) continue;
            let nthDay = <number>this.toEpoch(event.start);
            if (!this.events[nthDay])
                this.events[nthDay] = { items: [], numMoreItems: 0 };
            if (this.events[nthDay].items.length < this.eventLimit)
                this.events[nthDay].items.push(event);
            else
                this.events[nthDay].numMoreItems++;
        }
        this.dayOfMonth = {} as Dictionary<number>;
        for (let weekIndex = 0; weekIndex < this.weeks.length; weekIndex++)
            for (let dayIndex = 0; dayIndex < this.days.length; dayIndex++) {
                 let dayOfEpoch = <number>this.viewStart + (weekIndex * 7) + dayIndex;
                 this.dayOfMonth[dayOfEpoch] = this.fromEpoch(dayOfEpoch).date();
            }
    }

    public datesChanged(emit: boolean = true) {
        this.weeks = [];
        for (let i = 0; i < Math.ceil(this.numDaysToShow / 7); i++)
            this.weeks.push(i);
        this.days = (this.numDaysToShow === 1) ? [this.centralDayUTC.clone().add(moment().utcOffset(), "minute").format('ddd')] : SharedCalendarComponent.daysOfWeek;
        if (emit) setTimeout(() => this.calculateEventLimit());

        if (this.numDaysToShow === 1) {
            this.intervalStart = this.centralDayUTC.clone().add(moment().utcOffset(), "minute").startOf('day');//this.centralDay.clone()/*.utc()*/.startOf('day');
            this.intervalEnd = this.intervalStart.clone().endOf('day');
            this.viewStart = this.toEpoch(this.intervalStart);
        }
        else {
            this.intervalStart = this.centralDayUTC.clone().startOf('week');
            this.intervalEnd = this.intervalStart.clone().add(this.numDaysToShow - 1, 'day').endOf('day');
            this.viewStart = this.toEpoch(this.intervalStart);
        }
        if (emit) this.onDatesChanged.emit(this.getViewObject());
    }

    getViewObject(): ViewObject {
        return new ViewObject(this.intervalStart.clone(), this.intervalEnd.clone(), this.numDaysToShow, this.centralDayUTC.clone());
    }

    // user actions //////

    navToToday() {
        this.centralDayUTC = moment().utc();
        this.datesChanged();
    }

    gotoDate(m: moment.Moment) {
        if (this.centralDayUTC.isSame(m)) return;
        this.centralDayUTC = m;
        this.datesChanged();
    }

    navToNext() {
        this.centralDayUTC = this.centralDayUTC.add(+this.numDaysToShow, 'day');
        this.datesChanged();
    }

    navToPrev() {
        this.centralDayUTC = this.centralDayUTC.add(-this.numDaysToShow, 'day');
        this.datesChanged();
    }

    changeView(n: number) {
        this.numDaysToShow = n;
        this.datesChanged();
    }

    onItemClick($event: Event, item: ICalendarItem) {
        $event.stopPropagation();
        $event.preventDefault();
        this.itemClick.emit(item);
    }

    onDayClick(n: NthDaySinceEpoch) {
        this.dayClick.emit(new DayClick(moment(<number>n * msPerDay), this.getViewObject()));
    }

    onMoreClick($event: Event, n: NthDaySinceEpoch) {
        $event.stopPropagation();
        $event.preventDefault();
        this.moreClick.emit(new MoreClick(moment(<number>n * msPerDay)));
    }

    onDropSuccess($event: ng2dnd.DragDropData, to: NthDaySinceEpoch) {
        let id: guid = $event.dragData[0];
        let from: NthDaySinceEpoch = $event.dragData[1];
        if (!from) // then was dragged from the 'create a new..' tool palette
            this.dropNew.emit(new DropOnDay(this.fromEpoch(to), id, $event.mouseEvent, () => void 0))
        else { // then was an existing event dragged between days
            this.move(id, from, to);
            this.dropExisting.emit(new DropOnDay(this.fromEpoch(to), id, $event.mouseEvent, () => this.move(id, to, from)));
        }
    }

    // private ///////////

    private move(id: any, from: NthDaySinceEpoch, to: NthDaySinceEpoch): void {
        let model = this.items.find(e => e.id === id);
        if (!model || !model.start) return;
        model.start = model.start.add(<number>to - <number>from, 'day');
        this.itemsChanged();
    }

    private toEpoch(d: moment.Moment): NthDaySinceEpoch {
        return Math.floor(d.valueOf() / msPerDay); // a midnight UTC date will divide evenly, not needing the floor()
    }

    private fromEpoch(n: NthDaySinceEpoch): moment.Moment {
        return moment(<number>n * msPerDay).utc();
    }

}
