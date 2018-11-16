import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

export interface ITreeViewItem {
    tvmChildren: ITreeViewItem[];
    tvmLabel: string;
    tvmCollapsed: boolean;
    tvmSelectable: boolean;
    [key: string]: string | any;
}

// TREE-VIEW-MENU //////////////////////////////////////////////////////////////////////////////////

@Component({
    selector: 'tree-view-menu',
    template: ` <tree-view-menu-filter *ngIf="showFilter" class="form-group" (change)="searchTextChanged($event)"></tree-view-menu-filter>
	    	    <div class="well no-shadow b pl0 max-hd max-hd-lg">
                	<tree-view [models]="trees" [searchText]="searchText" [selectedNode]="selectedNode" (collapse)="toggleCollapse($event)" (select)="clickName($event)"></tree-view>
		        </div>`,
})
export class TreeViewMenuComponent<T> {
    // pass-in
    @Input() models: T[];
    @Input() idProperty: string;
    @Input() parentIdProperty: string;
    @Input() labelProperties: string[] | string; // wrap property name in 'quotes' or pass array of ['several','property','names']
    @Input() selectableProperty: string;
    @Input() showFilter: boolean;
    @Output() select = new EventEmitter<T & ITreeViewItem>();

    trees: (T & ITreeViewItem)[];
    selectedNode: (T & ITreeViewItem);
    searchText: string;

    ngOnInit(): void {
        if (!this.models.length) throw new Error("None found."); // No models found in <tree-view-menu models='...' />
        this.searchText = "";
        this.selectedNode = <T & ITreeViewItem>{};

        // create this.scope.tree as a forest of trees, from a list of nodes with connecting properties childNode.parentIdProperty == parentNode.idProperty
        this.trees = [];
        var labelProperties = this.labelProperties;
        var indexIntoModelsFromId: Dictionary<number> = {};
        var modelsWithMixin: (T & ITreeViewItem)[] = <(T & ITreeViewItem)[]>(this.models);

        // init tvmChildren & all other ITreeViewItem properties
        modelsWithMixin.forEach((model: T & ITreeViewItem, i: number) => {
            model.tvmChildren = [];
            model.tvmCollapsed = true;
            model.tvmSelectable = !!model[this.selectableProperty];
            model.tvmLabel = (typeof labelProperties === 'string')
                ? model[labelProperties]
                : labelProperties.reduce((accumulatedLabel, labelProperties, index) => {
                    if (model[labelProperties]) {
                        if (index > 0)
                            accumulatedLabel += ' - ';
                        accumulatedLabel += model[labelProperties];
                    }
                    return accumulatedLabel;
                }, '');

            // Q: where in the models array is my parent model?   A: What's your parent's ID? The ID-to-index map says your parent is at index "i".
            indexIntoModelsFromId[model[this.idProperty]] = i;
        });

        // uses tvmChildren property
        modelsWithMixin.forEach((model: T & ITreeViewItem) => {
            var myParentID: string = model[this.parentIdProperty];
            var myParent: T & ITreeViewItem = (myParentID) ? modelsWithMixin[indexIntoModelsFromId[myParentID]] : null;
            if (myParent)
                myParent.tvmChildren.push(model);
            else
                this.trees.push(model);
        });

        // sort top level + open first node & sort it
        this.trees = this.trees.sort((a, b) => a.tvmLabel.localeCompare(b.tvmLabel));
        if (this.trees.length) this.toggleCollapse(this.trees[0]);
    }

    clickName(node: T & ITreeViewItem): void {
        //console.log("upper clickname", node);
        if (node.tvmSelectable)
            this.selectNode(node);
        else
            this.toggleCollapse(node);
    }

    selectNode(node: T & ITreeViewItem): void {
        //console.log("selectNode", node);
        this.selectedNode = node;
        this.select.emit(node);
    }

    toggleCollapse(node: T & ITreeViewItem): void {
        //console.log("lower toggleCollapse", node);
        node.tvmCollapsed = !node.tvmCollapsed;
        if (!node.tvmCollapsed && node.tvmChildren)
            node.tvmChildren = node.tvmChildren.sort((a, b) => a.tvmLabel.localeCompare(b.tvmLabel));
    }

    searchTextChanged(newText: string) {
        this.searchText = newText;
    }
}

// TREE-VIEW-MENU-FILTER //////////////////////////////////////////////////////////////////////////////////

@Component({
    selector: 'tree-view-menu-filter',
    template: `
<div class="input-group">
    <span class="input-group-addon" style="background-color:white;"><a><i class="fa fa-search blue"></i></a></span>
    <input type="text" [(ngModel)]="searchText" class="form-control" placeholder="Filter..." (change)="changed($event)" />
</div><br/>`,
})
export class TreeViewMenuFilter {
    searchText: string;
    @Output() change = new EventEmitter<string>();

    changed(event: KeyboardEvent) {
        if (event.keyCode == 13)
            event.preventDefault();
        else
            this.change.emit(this.searchText);
    }
}


// TREE-VIEW /////////////////////////////////////////////////////////////////

@Component({
    //require: "^treeViewMenu",
    selector: 'tree-view',
    template: `
<ul class="treeview">
	<li *ngFor="let node of models">
        <div class="text-ellipsis">
		    <span *ngIf="node.tvmChildren.length" style="cursor:pointer;" (click)="toggleCollapse(node)">
			    <i *ngIf="node.tvmCollapsed && !searchText" class="fa fa-fw fa-folder-o"></i>
			    <i *ngIf="!node.tvmCollapsed || searchText" class="fa fa-fw fa-folder-open-o"></i>
		    </span>
		    <span *ngIf="!node.tvmChildren.length">
			    <i class="fa fa-fw fa-file-o"></i>
		    </span>
		    <span (click)="clickName(node)" class="node-label" [class.selected]="node === selectedNode" [class.selectable]="node.tvmSelectable">{{node.tvmLabel}}</span>
		</div>
		<tree-view *ngIf="!node.tvmCollapsed || searchText" [models]="node.tvmChildren" [searchText]="searchText" [selectedNode]="selectedNode" (collapse)="toggleCollapse($event)" (select)="clickName($event)"></tree-view>
	</li>
</ul>`,    //  TODO  filter:searchText"
})
export class TreeView {
    @Input() models: ITreeViewItem[];
    @Input() selectedNode: ITreeViewItem;
    @Input() searchText: string;
    @Output() select = new EventEmitter<ITreeViewItem>();
    @Output() collapse = new EventEmitter<ITreeViewItem>();

    clickName(node: ITreeViewItem): void {
        //console.log("lower clickname", node); 
        this.select.emit(node);
    }

    toggleCollapse(node: ITreeViewItem): void {
        //console.log("lower toggleCollapse", node);
        this.collapse.emit(node);
    }

}