/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { of as observableOf } from 'rxjs';
import { NbAuthJWTToken, NbAuthService, NbPasswordAuthStrategy, NbAuthModule } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {
    NbDialogModule,
    NbMenuModule,
    NbSidebarModule,
} from '@nebular/theme';
import { ApiModule } from '@kowabunga-cloud/angular';
import { AuthGuard } from './auth-guard.service';
import { RoleProvider } from './role.provider';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ApiModule,
        HttpClientModule,
        AppRoutingModule,
        NbAuthModule.forRoot({
            strategies: [
                NbPasswordAuthStrategy.setup({
                    name: 'email',
                    baseEndpoint: '',
                    token: {
                        class: NbAuthJWTToken,
                        key: 'jwt',
                    },
                    login: {
                        endpoint: '/api/v1/login',
                        method: 'post',
                        redirect: {
                            success: '/pages/dashboard',
                            failure: null, // stay on the same page
                        },
                    },
                    logout: {
                        endpoint: '/', // trick: callback is done at controller level for JWT invalidation
                        method: 'get',
                        redirect: {
                            success: '/auth/login',
                            failure: '/auth/login',
                        },
                    },
                    requestPass: {
                        endpoint: '/api/v1/resetPassword',
                        method: 'put',
                        redirect: {
                            success: '/auth/login',
                            failure: null, // stay on the same page
                        },
                    }
                }),
            ],
            forms: {
                login: {
                    redirectDelay: 500,
                    rememberMe: true,
                },
                logout: {
                    redirectDelay: 500,
                    strategy: 'email',
                },
            },
        }),
        NbSecurityModule.forRoot({
            accessControl: {
                user: {
                    view: ['user'],
                },
                projectAdmin: {
                    parent: 'user',
                    view: ['user'],
                },
                superAdmin: {
                    parent: 'projectAdmin',
                    view: ['admin'],
                },
            },
        }),
        NbDialogModule.forRoot(),
        NbSidebarModule.forRoot(),
        NbMenuModule.forRoot(),
        CoreModule.forRoot(),
        ThemeModule.forRoot(),
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        AuthGuard,
        { provide: NbRoleProvider, useClass: RoleProvider },
    ],
})
export class AppModule {
}
