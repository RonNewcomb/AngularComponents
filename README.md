# AngularComponents
Some non-trivial components for Angular I made and found useful.  Some of them I'm proud of because the code is complex, such as the trig calculation in Pie chart or all the stuff regarding Calendar.  Some of them I'm proud of because they keep client code neat, such as err and css-grid.

## &lt;css-grid&gt;
  
  Made because IE11's implementation of CSS grid is very different than modern broswers'.  If you want to use Angular variables to change which cell some content is in, it's actually non-trivial if you wish to support IE.  This component only supports what features of CSS Grid that IE supports and hides the details from the client code. 
  
  ```html
      <css-grid grid-template="1fr auto auto auto / {{phase >= phases.Completing ? '3fr 2fr 2fr' : '3fr 3fr 1fr'}}" column-gap="{{phase >= phases.Completing ? '25px' : '50px'}}" row-gap="0px">

        <div grid-area="1/1">
            blah blah blah...
        </div>

        <div grid-area="1/2">
            blah blah blah...
        </div>

        <div grid-area="1/3/3" *ngIf="[phases.Completing, phases.FinalStatus].contains(phase)">
            blah blah blah...
        </div>

        <div [grid-area]="f.controls.CreateList?.value ? '2/1/2/5' : '1/1/1/5'">
            blah blah blah...
        </div>

        <err grid-area="4/1/4/4" place-self="right" *ngIf="f.submitted && f.invalid">
            Validation errors occured. Please check all fields and try again.
        </err>
    </css-grid>
```
    
## &lt;err&gt;

This trivial component just wraps form validation error messages.  It makes client code neater because it's shorter than div elements with a class attached, especially if using per-component CSS where the error class would be repeated in many many components across the entire app. 

```html
    <err *ngIf="f.submitted && f.invalid">Bad dog!</err>
```

## FormBuilder2

This is a strongly-typed interface lain over Angular's FormBuilder.  Related Stack Overflow question: https://stackoverflow.com/questions/44461636/fixed-length-array-with-optional-items-in-typescript-interface 

## &lt;flex-row&gt;

This is a CSS flexbox, in the horizontal "row" direction, as an Angular component.  Flexbox is such a major layout tool that I don't like to hunt for it among all the `div` and `class` verbiage in a lines like `<div class="mt p0 fbr"><div class="ko er">...` and taking a trip to the CSS file to see what's going on. 

The attribute `nowrap="x.x.x"` sets both the `flex-flow` and `justify-content` properties at once, and the `x.x.x` is a visual representation of `space-between`, like how `.xxx.` represents `center` and `..xxx` represents `flex-end`.

It is row-only because IE doesn't support flex-box columns properly, and a stack of divs largely does that job already fairly straightforwardly.

```html
<flex-row nowrap="x.x.x">
    <div class="form-group">
        blah blah blah
    </div>

    <div class="form-group">
        blah blah blah
    </div>
</flex-row>
```

## [flex]

A directive, related to the above, that sets the `flex` property on the children of a `flex-row`.  It accepts `top` and `bottom` as synonyms for `flex-start` and `flex-end` because it's more intuitive.

```html
<flex-row wrap=".xxx.">
    <div flex='stretch'>
        blah blah blah
    </div>

    <div [flex]='ctrl.model.position'>
        blah blah blah
    </div>
</flex-row>
```

## &lt;multi-picker&gt;

A dropdown which has a checkbox next to each item in the dropdown. 

```html
    <multi-picker name="States" [model]="model.states" (modelChange)="model.states = $event;" [data]="states" placeholder="Choose states..."></multi-picker>
```

## &lt;pie&gt;

Although the D3 library's pie charts are very pretty, they also take about two full minutes to render a pie chart with 4,000 slices, one for each county in the United States, and it then looks horrible.  This is because D3 draws each pie slice separately as two lines from the center with an arc, and does a .fill to fill it in. Each slice has it's own mouse event handler. 

This pie chart uses the dash-stroke and dash-array method of drawing the pie shown at https://www.smashingmagazine.com/2015/07/designing-simple-pie-charts-with-css/ , and uses one event handler for the whole thing, using some trig to figure out which slice was clicked.

This isn't standalone because of the legend, but the core of the idea is here.

```html
    <pie *ngSwitchCase="'pie'"
                     style="width:100%;height:100%;"
                     (drilldown)="drilldown($event, $index, chart.chartType)"
                     [chartDivElementId]="chart.id"
                     [data]="chart.data"
                     [selectedYFields]="chart.selectedYFields"
                     [yFields]="selectedTopic.aggregateFields"></pie>
```


## &lt;progress-bar&gt;

A simple progress bar using two divs and an animation.

```html
   <progress-bar [amount]='value' [max]='total'></progress-bar>
```

## &lt;shared-calendar&gt;

## &lt;tree-view-menu&gt;

