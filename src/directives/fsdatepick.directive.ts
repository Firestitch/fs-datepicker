import { Directive, Input, Output, Inject, HostListener, ComponentFactoryResolver, ViewContainerRef,
   Renderer, ElementRef, EventEmitter, Pipe, OnInit, OnDestroy } from '@angular/core';
import { DATEPICKER_VALUE_ACCESSOR } from './../value-accessors';
import { FsDatepickerComponent } from './../components/fsdatepicker/fsdatepicker.component';
import { FsDatepickerFactory } from './../services/fsdatepickerfactory.service';
import { FsDatePickerCommon } from './../services/fsdatepickercommon.service';
import { FsUtil } from '@firestitch/common';
import * as moment from 'moment-timezone';

@Directive({
    host: {
      '(input)': 'onChangeInterceptor($event)',
      '(click)': 'inputClick($event)',
      '(keyup)': 'inputKeyup($event)',
      '(blur)': 'inputBlur($event)',
    },
    selector: '[fsDatePicker]',
    providers: [DATEPICKER_VALUE_ACCESSOR]
})
export class FsDatePickDirective implements OnInit, OnDestroy {

    // @Input('hasCalendar') hasCalendar: boolean;
    // @Input('hasDate') hasDate: boolean;
    @Input() minYear;
    @Input() maxYear;
    // @Input('hasTime') hasTime = false;
    @Input() view = 'date';

    // @Input() disabledDays = null;
    // @Input() disabledMinutes = [];
    // @Input() disabledHours = [];
    // @Input() disabledTimes = [];

    @Output('change') change$ = new EventEmitter<any>();

    private _model = null;

    opened = false;

    // @TODO
    selected = {};

    // @TODO I don't like this variable. Try to kill it.
    yearList = [];

    private $dialog = null;

    private rootViewContainer = null;

    _onTouched = () => { };
    _onChange = (value: any) => { };
    onFocused = (event: any) => { };

    // we initiate those functions to emit events outside the component
    registerOnChange(fn: (value: any) => any): void { this._onChange = fn }
    registerOnTouched(fn: () => any): void { this._onTouched = fn }

    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        @Inject(Renderer) private renderer: Renderer,
        @Inject(ComponentFactoryResolver) private factoryResolver,
        @Inject(ViewContainerRef) private viewContainerRef,
        private fsDatePickerCommon: FsDatePickerCommon,
        private fsDatepickerFactory: FsDatepickerFactory,
        private FsUtil: FsUtil
    ) { }

    ngOnInit() {
    }

    onChangeInterceptor($event) {
      this.writeValue($event.target.value);
    }

    writeValue(value: any): void {
      if (value) {

        if (moment(value).isValid()) {
          value = moment(value);
        }else {
          value = undefined;
        }

        this._model = value;

        this._onChange(value);
        this.render(this._elementRef);
        this.change$.emit(value);
      }
    }

    getValue() {
      return this._model ? moment(this._model) : this._model;
    }

    private open() {
      this.opened = true;

      if (this.$dialog) {
        // this.$dialog.instance.drawMonths(this.getValue());
        return;
      }

      this.fsDatepickerFactory.setRootViewContainerRef(this.viewContainerRef);
      this.$dialog = this.fsDatepickerFactory.addDynamicComponent();
      this.$dialog.instance.parentInstance = this;

      this.$dialog.instance.fsDatePickerModel.view = this.view;
      this.$dialog.instance.fsDatePickerModel.minYear = this.minYear;
      this.$dialog.instance.fsDatePickerModel.maxYear = this.maxYear;
      // @TODO provide input values into model service
      // console.log(this.$dialog.instance);
      // this.$dialog.instance.fsDatePickerModel = this.fsDatePickerModel;
      // this.$dialog.instance.drawMonths(this.getValue());
      setTimeout(() => {
        this.positionDialog();
      });
    }

    private inputClick(e) {

      let x = e.clientX,
      y = e.clientY,
      stack = [],
      el;

      do {

        el = document.elementFromPoint(x, y);

        const last = stack[stack.length - 1];

        if (last && last.isEqualNode(el)) {
          break;
        }

        el.classList.add('pointer-events-none');
        stack.push(el);

        if (el.className.match('/fs-datetime-backdrop/')) {
          setTimeout(function() {
            el.click();
          });
          break;
        }
      } while (el.tagName !== 'HTML' && !el.tagName.match(/^FS-DATETIME/));

      for (let i = 0; i < stack.length; i += 1) {
          stack[i].classList.remove('pointer-events-none');
      }

      this.open();
    }

    inputKeyup(e) {
      if (e.keyCode === 13) {
        this.inputBlur(e);
      }
    }

    inputBlur(event) { }

    @HostListener('window:resize', ['$event'])
    onWindowResize(event) {
      this.positionDialog();
    }

    positionDialog() {

      if (!this.$dialog || window.innerWidth < 500) {
        return;
      }

      const input = this._elementRef.nativeElement;
      const dialogContainer = this.$dialog.instance.element.nativeElement.querySelector('.fs-datetime-dialog');
      const dialogContainerStyles = window.getComputedStyle(dialogContainer);
      const inputBound = input.getBoundingClientRect();
      const dialogBound = this.$dialog.instance.element.nativeElement.getBoundingClientRect();
      const dialogContainerBound = dialogContainer.getBoundingClientRect();
      const top = parseInt(inputBound.top) + inputBound.height;

      let css = { top: '', bottom: '', left: '', right: '' };

      if ((top + this.FsUtil.int(dialogContainer.style.marginTop) + this.FsUtil.int(dialogContainerStyles.height)) > window.innerHeight) {
        css.bottom = '10px';
        dialogContainer.classList.add('vertical-reposition');
      } else {
        css.top = top + 'px';
        dialogContainer.classList.remove('vertical-reposition');
      }

      const left = parseInt(inputBound.left);

      if ((left + this.FsUtil.int(dialogContainerStyles.width)) > window.innerWidth) {
        css.right = '10px';
        dialogContainer.classList.add('horizontal-reposition');
      } else {
        css.left = left + 'px';
        dialogContainer.classList.remove('horizontal-reposition');
      }

      for (let i in css) {
        dialogContainer.style[i] = css[i];
      }
    }

    render(input) {
      let format = [],
        options = {},
        value = this.getValue();

      if (this.FsUtil.isInt(value)) {
        value = moment(new Date(value));
      } else if (this.FsUtil.isString(value)) {
        if (moment(value).isValid()) {
          value = moment(value);
        } else {
          value = moment(Date.parse(value));
        }
      }

      if (value && moment(value).isValid()) {

        if (['date', 'datetime'].indexOf(this.view) != -1) {
          format.push('MMM D, YYYY');
        }

        if (['time', 'datetime'].indexOf(this.view) != -1) {
          format.push('h:mm a');
        }

        input.nativeElement.value = value.format(format.join(' '));

        let year = parseInt(value.format('YYYY'));

        // @TODO do something with this code
        if (parseInt(this.selected['year']) != year) {
          this.yearList = [];
          for (let y = year + 100; y > (year - 100); y--) {
            this.yearList.push(y);
          }
        }
      } else {
        input.nativeElement.value = '';
      }

      this.selected = this.fsDatePickerCommon.getSelected(value);
    }

    ngOnDestroy() {
      if (this.$dialog && this.$dialog.instance.element.nativeElement.parentNode) {
        this.$dialog.instance.element.nativeElement.parentNode.removeChild(this.$dialog.instance.element.nativeElement);
      }
    }
}