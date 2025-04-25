import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from './module-import-guard';
import {
    LayoutService,
    UtilsService,
    KowabungaApiService,
    KowabungaService,
} from './utils';

export const NB_CORE_PROVIDERS = [
    LayoutService,
    UtilsService,
    KowabungaApiService,
    KowabungaService,
];

@NgModule({
    imports: [
        CommonModule,
    ],
    exports: [
        //NbAuthModule,
    ],
    declarations: [],
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
    }

    static forRoot(): ModuleWithProviders<CoreModule> {
        return {
            ngModule: CoreModule,
            providers: [
                ...NB_CORE_PROVIDERS,
            ],
        };
    }
}
