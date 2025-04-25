/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from '@angular/core';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import { NbAccessChecker } from '@nebular/security';
import { MENU_DEFAULT_ITEMS, MENU_ADMIN_ITEMS, MENU_USER_ITEMS } from './pages-menu';

@Component({
    selector: 'ngx-pages',
    styleUrls: ['pages.component.scss'],
    template: `
<ngx-one-column-layout>
<nb-menu [items]="menu"></nb-menu>
<router-outlet></router-outlet>
</ngx-one-column-layout>
`,
})
export class PagesComponent {
    menuAdmin = MENU_DEFAULT_ITEMS.concat(MENU_ADMIN_ITEMS).concat(MENU_USER_ITEMS);
    menuUser = MENU_DEFAULT_ITEMS.concat(MENU_USER_ITEMS);
    menu = this.menuUser;

    constructor(private authService: NbAuthService,
                public accessChecker: NbAccessChecker) {
        this.accessChecker.isGranted('view', 'admin')
            .subscribe((isAdmin: boolean) => {
                this.menu = isAdmin ? this.menuAdmin : this.menuUser;
            });
    }
}
