/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { KaktusComponent } from './kaktus/kaktus.component';
import { KomputeComponent } from './kompute/kompute.component';
import { KyloComponent } from './kylo/kylo.component';
import { KawaiiComponent } from './kawaii/kawaii.component';
import { KonveyComponent } from './konvey/konvey.component';
import { RecordsComponent } from './records/records.component';
import { UserComponent } from './user/user.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';

const routes: Routes = [{
    path: '',
    component: PagesComponent,
    children: [
        {
            path: 'dashboard',
            component: DashboardComponent,
        },
        {
            path: 'kaktus',
            component: KaktusComponent,
        },
        {
            path: 'kompute',
            component: KomputeComponent,
        },
        {
            path: 'kylo',
            component: KyloComponent,
        },
        {
            path: 'kawaii',
            component: KawaiiComponent,
        },
        {
            path: 'konvey',
            component: KonveyComponent,
        },
        {
            path: 'records',
            component: RecordsComponent,
        },
        {
            path: 'user',
            component: UserComponent,
        },
        {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
        },
        {
            path: '**',
            component: NotFoundComponent,
        },
    ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule {
}
