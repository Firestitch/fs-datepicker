import { Component, Input, HostListener, ViewChild, ElementRef, IterableDiffers,
  ViewEncapsulation, OnInit, DoCheck } from '@angular/core';
import { FsDatePickerModel } from './../../services/fsdatepickermodel.service';
import { FsDatePickerCommon } from './../../services/fsdatepickercommon.service';
import * as moment from 'moment-timezone';

@Component({
    selector: 'fsDatePickerRange',
    templateUrl: './fsdatepickerrange.component.html',
    styleUrls: ['./../../styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [FsDatePickerModel]
})
export class FsDatepickerRangeComponent implements OnInit, DoCheck {

  parentInstance: any = null;

  toDisabledDays = [];
  toDisabledTimes = [];

  private modelDiffer = null;

  constructor(
    public fsDatePickerModel: FsDatePickerModel,
    private fsDatePickerCommon: FsDatePickerCommon,
    public element: ElementRef,
    private _iterableDiffers: IterableDiffers
  ) {
    this.modelDiffer = this._iterableDiffers.find([]).create(null);
  }

  ngOnInit() { }

  ngDoCheck() {
    if (this.modelDiffer.diff([this.parentInstance.ngModelStart, this.parentInstance.ngModelEnd])) {

      const startDate = this.parentInstance.ngModelStart;
      let endDate = this.parentInstance.ngModelEnd;

      if (startDate && endDate && endDate.isBefore(startDate)) {
        endDate = startDate.isSame(endDate, 'day') ? startDate : undefined;
        setTimeout(() => {
          this.setEndDate(endDate);
        });
      }
      this.toDisabledDaysUpdate(startDate, endDate);
      this.toDisabledTimesUpdate(startDate, endDate);
    }
  }

  setStartDate(date) {

    let startDate = date;
    let endDate = this.parentInstance.ngModelEnd;

    if (this.parentInstance.ngModelStart && !this.parentInstance.ngModelEnd) {
      startDate = this.parentInstance.ngModelStart;
      endDate = date;
    } else if (this.parentInstance.ngModelStart && this.parentInstance.ngModelEnd) {
      startDate = null;
      endDate = null;
    }

    if (moment(startDate).isAfter(endDate)) {
      startDate = endDate;
      endDate = null;
    }

    this.setDates(startDate, endDate);
  }

  setEndDate(date) {
    this.setDates(this.parentInstance.ngModelStart, date);
  }

  setStartTime(date) {
    let endDate = this.parentInstance.ngModelEnd;
    // In time mode, if end date is empty - user not able switch to end time picker
    if (this.fsDatePickerModel.view === 'time' && !this.parentInstance.ngModelEnd) {
      endDate = date;
    }
    this.setDates(date, endDate);
  }

  setEndTime(date) {
    this.setDates(this.parentInstance.ngModelStart, date);
  }

  setDates(startDate, endDate) {
    this.parentInstance.writeValue(startDate, endDate);
  }

  onDatesChange(data) {
    this.setDates(data.start, data.end);
  }

  toDisabledDaysUpdate(startDate, endDate) {
    this.toDisabledDays = startDate ? [[moment().subtract(99, 'year'), startDate.clone()]] : [];
  }

  toDisabledTimesUpdate(startDate, endDate) {
    this.toDisabledTimes = [];

    if (startDate && endDate && startDate.isSame(endDate, 'day')) {

      const from = parseInt(startDate.format('m')) + (parseInt(startDate.format('H')) * 60);
      const to = parseInt(endDate.format('m')) + (parseInt(endDate.format('H')) * 60);

      if (startDate) {
        this.toDisabledTimes.push([0, from]);
      }
    }
  }

  setDateModeStart(mode) {
    this.fsDatePickerModel.dateMode.start_date = mode;
  }

  setDateModeEnd(mode) {
    this.fsDatePickerModel.dateMode.end_date = mode;
  }

  setComponents(data) {
    this.fsDatePickerModel.components = data;
  }

  close($event?) {
    this.parentInstance.opened = false;
  }

  @HostListener('document:keydown', ['$event'])
  documentKeydown(e) {
    if (e.keyCode === 27) {
        // Be careful with preventing default events. Breaking page refresh functional
        e.preventDefault();
        this.close(e);
      }
  }
}
