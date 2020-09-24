import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Injector,
  Input,
  OnDestroy,
  OnInit, Optional
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseRangePickerComponent } from '../base/range-picker-base.component';
import { FsRangePickerStoreService } from '../../../services/range-picker-store.service';
import { FsDatepickerFactory } from '../../../services/factory.service';
import { MatFormField } from '@angular/material/form-field';


@Component({
  selector: '[fsDateRangeFrom]',
  template: '<fs-clear [show]="value && ((!disabled && !readonly && !hideClearButton) || !!dateDialogRef)" (clear)="cleared($event)"></fs-clear>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerFromComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerFromComponent extends BaseRangePickerComponent implements OnInit, OnDestroy {

  @Input('fsDateRangeFrom')
  public name: string;

  constructor(
    _elRef: ElementRef,
    _injector: Injector,
    _datepickerFactory: FsDatepickerFactory,
    _cdRef: ChangeDetectorRef,
    private _rangePickerStore: FsRangePickerStoreService,
    @Optional() _parentFormField: MatFormField,
  ) {
    super(_elRef, _injector, _datepickerFactory, 'from', _cdRef, _parentFormField);
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
    this._pickerRef = this._rangePickerStore.registerPickerFrom(this.name, this.value, this.view);
  }

  public writeValue(value) {
    super.writeValue(value);

    const [valuesAreDates, datesAreEquals] = this._checkValuesEquality(value, this._pickerRef.startDate);

    if ((valuesAreDates && !datesAreEquals) || (!valuesAreDates && this._pickerRef.startDate !== value)) {
      this._pickerRef.updateStartDate(this.value);
    }
  }

  public cleared(event) {
    event.stopPropagation();
    event.preventDefault();
    this.writeValue(null);

    this.onChange(this.value);
    this.onTouch(this.value);
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
