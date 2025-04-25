/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import {
    NbCardModule,
    NbActionsModule,
    NbIconModule,
    NbTooltipModule,
    NbDialogModule,
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { KomputeComponent } from './kompute.component';
import { KomputeDialogComponent } from './components/dialog.component';

@NgModule({
    imports: [
        ThemeModule,
        NbCardModule,
        NbActionsModule,
        NbIconModule,
        NbTooltipModule,
        NbDialogModule.forChild(),
    ],
    declarations: [
        KomputeComponent,
        KomputeDialogComponent,
    ],
    providers: [],
})
export class KomputeModule { }
