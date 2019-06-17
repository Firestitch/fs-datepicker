import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isAfter, isDate } from 'date-fns';


export class RangePickerRef {

  private _startDatePickerExists = false;
  private _endDatePickerExists = false;

  private _valueChange$ = new ReplaySubject(1);

  private _startDate = null;
  private _endDate = null;

  private _destroy$ = new Subject();

  constructor(public view: string) {}

  public get valueChange$() {
    return this._valueChange$.pipe(takeUntil(this._destroy$));
  }

  public get startDate() {
    return this._startDate;
  }

  public get endDate() {
    return this._endDate;
  }

  public get startDatePickerExists() {
    return this._startDatePickerExists;
  }

  public get endDatePickerExists() {
    return this._endDatePickerExists;
  }

  /**
   * Update start date and change end date if needed
   * @param value
   */
  public updateStartDate(value: Date) {
    this._startDate = value;

    this._startDatePickerExists = true;

    if (!this.isDateAfter(this._endDate, this._startDate)) {
      this.updateEndDate(null);
    }

    this._valueChange$.next(value);
  }

  /**
   * Update end date
   * @param value
   */
  public updateEndDate(value: Date) {
    if (!this.isDateAfter(value, this._startDate)) {
      value = null;
    }

    this._endDate = value;

    this._valueChange$.next(value);
    this._endDatePickerExists = true;
  }

  /**
   * Mark start date picker as destroyed
   */
  public destroyStartDatePicker() {
    this._startDatePickerExists = false;
  }

  /**
   * Mark end date picker as destroyed
   */
  public destroyEndDatePicker() {
    this._endDatePickerExists = false;
  }

  /**
   * destroy everything related with picker
   */
  public destroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private getTimeCompareDate(fromDate) {
    if (!isDate(fromDate)) {
      return null;
    }

    const date = new Date();

    date.setHours(fromDate.getHours());
    date.setMinutes(fromDate.getMinutes());
    date.setSeconds(fromDate.getSeconds());
    date.setMilliseconds(fromDate.getMilliseconds());

    return date;
  }

  private isDateAfter(target, from) {
    let startDate, endDate;

    if (this.view === 'time') {
      if (from) {
        startDate = this.getTimeCompareDate(from);
      }

      if (target) {
        endDate = this.getTimeCompareDate(target);
      }
    } else {
      startDate = from;
      endDate = target;
    }

    return !startDate || !endDate || isAfter(endDate, startDate);
  }
}