import { ComponentFactoryResolver, Injectable, Inject, ReflectiveInjector } from '@angular/core';
import { FsDatepickerComponent } from './../components/fsdatepicker/fsdatepicker.component';

@Injectable()
export class FsDatepickerFactory {

  private factoryResolver = null;
  private rootViewContainer = null;

  constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
    this.factoryResolver = factoryResolver;
  }

  setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef;
  }

  addDynamicComponent() {
    const factory = this.factoryResolver
                        .resolveComponentFactory(FsDatepickerComponent);

    const component = factory
      .create(this.rootViewContainer.parentInjector);

    this.rootViewContainer.insert(component.hostView);

    return component;
  }
}