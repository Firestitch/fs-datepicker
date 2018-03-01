import { EventEmitter, ElementRef, IterableDiffers, OnInit, OnChanges, DoCheck } from '@angular/core';
import { FsUtil } from '@firestitch/common';
import { FsDatePickerCommon } from './../../services/fsdatepickercommon.service';
import { FsDatePickerModel } from './../../services/fsdatepickermodel.service';
export declare class FsDatePickerTimeComponent implements OnInit, OnChanges, DoCheck {
    element: ElementRef;
    private fsDatePickerCommon;
    fsDatePickerModel: FsDatePickerModel;
    private fsUtil;
    private _iterableDiffers;
    date: any;
    disabledMinutes: any[];
    disabledHours: any[];
    disabledTimes: any[];
    onChange: EventEmitter<any>;
    selected: {};
    disabledTimeMinutes: {};
    disabledTimeHours: {};
    disabledGroupedMinutes: {};
    private disabledMinutesDiffer;
    private disabledHoursDiffer;
    private disabledTimesDiffer;
    timeHours: number[][];
    timeMinutes: number[][];
    constructor(element: ElementRef, fsDatePickerCommon: FsDatePickerCommon, fsDatePickerModel: FsDatePickerModel, fsUtil: FsUtil, _iterableDiffers: IterableDiffers);
    ngOnInit(): void;
    ngOnChanges(changes: any): void;
    ngDoCheck(): void;
    checkDisabledTime(): void;
    addDisabledMinutes(range: any): void;
    addDisabledHours(range: any): void;
    createModel(): void;
    setDate(date: any): void;
    hourClick(hour: any): void;
    minuteClick(minute: any): void;
}
