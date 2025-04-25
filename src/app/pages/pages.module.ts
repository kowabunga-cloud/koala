/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { KaktusModule } from './kaktus/kaktus.module';
import { KomputeModule } from './kompute/kompute.module';
import { KyloModule } from './kylo/kylo.module';
import { KawaiiModule } from './kawaii/kawaii.module';
import { KonveyModule } from './konvey/konvey.module';
import { RecordsModule } from './records/records.module';
import { UserModule } from './user/user.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';

@NgModule({
    imports: [
        PagesRoutingModule,
        ThemeModule,
        NbMenuModule,
        DashboardModule,
        KaktusModule,
        KomputeModule,
        KyloModule,
        KawaiiModule,
        KonveyModule,
        RecordsModule,
        UserModule,
        MiscellaneousModule,
    ],
    declarations: [
        PagesComponent,
    ],
})
export class PagesModule {
}
