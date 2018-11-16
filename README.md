# AngularComponents
Some non-trivial components for Angular I made and found useful.  Some of them I'm proud of because the code is complex, such as the trig calculation in Pie chart or all the stuff regarding Calendar.  Some of them I'm proud of because they keep client code neat, such as err and css-grid.

## &lt;css-grid&gt;
  
  Made because IE11's implementation of CSS grid is very different than modern broswers'.  If you want to use Angular variables to change which cell some content is in, it's actually non-trivial if you wish to support IE.  This component only supports what features of CSS Grid that IE supports and hides the details from the client code. 
  
  ```
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
    
    
