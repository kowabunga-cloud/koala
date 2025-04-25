/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import {
    NbCardModule,
    NbActionsModule,
    NbToggleModule,
    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    NbButtonModule,
} from '@nebular/theme';
import { FormsModule } from '@angular/forms';

import { ThemeModule } from '../../@theme/theme.module';
import { UserComponent } from './user.component';

@NgModule({
    imports: [
        ThemeModule,
        NbCardModule,
        NbActionsModule,
        NbToggleModule,
        NbFormFieldModule,
        NbInputModule,
        NbIconModule,
        NbButtonModule,
        FormsModule,
    ],
    declarations: [
        UserComponent,
    ],
    providers: [],
})
export class UserModule { }
