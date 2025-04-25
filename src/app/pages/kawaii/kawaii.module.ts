/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import {
  NbCardModule,
  NbActionsModule,
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { KawaiiComponent } from './kawaii.component';

@NgModule({
    imports: [
        ThemeModule,
        NbCardModule,
        NbActionsModule,
    ],
    declarations: [
        KawaiiComponent,
    ],
    providers: [],
})
export class KawaiiModule { }
