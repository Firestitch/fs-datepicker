import {
  Component,
  ElementRef,
  forwardRef,
  Injector,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseRangePickerComponent } from '../base/range-picker-base.component';
import { FsRangePickerStoreService } from '../../../services/range-picker-store.service';
import { FsDatepickerFactory } from '../../../services/factory.service';


@Component({
  selector: '[fsDateRangeFrom]',
  template: '<fs-clear [show]="value" (clear)="cleared()"></fs-clear>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerFromComponent),
      multi: true
    }
  ]
})
export class DateRangePickerFromComponent extends BaseRangePickerComponent implements OnInit, OnDestroy {

  @Input('fsDateRangeFrom')
  public name: string;

  constructor(
    _elRef: ElementRef,
    _injector: Injector,
    _datepickerFactory: FsDatepickerFactory,
    private _rangePickerStore: FsRangePickerStoreService
  ) {
    super(_elRef, _injector, _datepickerFactory);
  }

  public ngOnInit() {
    this.registerPicker();
  }

  public ngOnDestroy() {
    this._rangePickerStore.destroyStartDatePicker(this.name);

    this._destroy$.next();
    this._destroy$.complete();
  }

  public registerPicker() {
    this._pickerRef = this._rangePickerStore.registerPickerFrom(this.name, this.value);
  }

  public writeValue(value) {
    super.writeValue(value);

    if (this._pickerRef.startDate !== value) {
      this._pickerRef.updateStartDate(value);
    }
  }

  public cleared() {
    this.writeValue(null);
  }

  /**
   * Set value which was selected in dialog
   * @param value
   */
  public updateValueFromDialog(value) {
    super.updateValueFromDialog(value);

    this._pickerRef.updateStartDate(value);
  }
}