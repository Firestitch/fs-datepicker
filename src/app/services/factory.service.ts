import { ElementRef, Injectable, Injector } from '@angular/core';
import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
  PositionStrategy,
  FlexibleConnectedPositionStrategy,
} from '@angular/cdk/overlay';

import { FsDatePickerDialogComponent } from '../components/date-picker-dialog/date-picker-dialog.component';
import { FsDateDialogRef } from '../classes/date-dialog-ref';
import { DIALOG_DATA } from './dialog-data';
import { FsDateScrollPickerDialogComponent } from '../components/date-scroll-picker-dialog/date-scroll-picker-dialog.component';


@Injectable()
export class FsDatepickerFactory {

  constructor(private _overlay: Overlay) {}

  public openDatePicker(el: ElementRef, injector: Injector, data: any) {
    const overlayRef = this._createOverlay(el);
    const dateDialogRef = new FsDateDialogRef(overlayRef);
    dateDialogRef.positionStrategy = this._createBasePopupPositionStrategy(el);

    this._openPortalPreview(injector, FsDatePickerDialogComponent, overlayRef, dateDialogRef, data);

    return dateDialogRef;
  }

  public openDateScrollPicker(el: ElementRef, injector: Injector, data: any) {
    const overlayRef = this._createOverlay(el, { scrollStrategy: this._overlay.scrollStrategies.block() });
    const dateDialogRef = new FsDateDialogRef(overlayRef);
    dateDialogRef.positionStrategy = this._createBasePopupPositionStrategy(el);

    this._openPortalPreview(injector, FsDateScrollPickerDialogComponent, overlayRef, dateDialogRef, data);

    return dateDialogRef;
  }

  private _createOverlay(el: ElementRef, config = {}) {
    config = Object.assign(
    {
      positionStrategy: this._createPopupPositionStrategy(el),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: [],
    }, config);

    const overlayConfig = new OverlayConfig(config);

    return this._overlay.create(overlayConfig);
  }

  private _openPortalPreview(
    parentInjector: Injector,
    component: ComponentType<any>,
    overlayRef: OverlayRef,
    previewRef: FsDateDialogRef,
    data: any,
  ) {
    const injector = this._createInjector(parentInjector, previewRef, data);
    const containerPortal = new ComponentPortal(component, undefined, injector);
    const containerRef = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private _createInjector(parentInjector, previewRef, data) {
    const injectionTokens = new WeakMap<any, any>([
      [FsDateDialogRef, previewRef],
      [DIALOG_DATA, data]
    ]);

    return new PortalInjector(parentInjector, injectionTokens);
  }

  private _createPopupPositionStrategy(el: ElementRef): PositionStrategy {
    return this._createBasePopupPositionStrategy(el)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        }
      ]);
  }

  private _createBasePopupPositionStrategy(el: ElementRef): FlexibleConnectedPositionStrategy {
    return this._overlay.position()
      .flexibleConnectedTo(el)
      .withGrowAfterOpen(true)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withLockedPosition()
  }
}
