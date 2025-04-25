/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@kowabunga-cloud/angular';
import { NB_AUTH_OPTIONS, NbLogoutComponent, NbAuthJWTToken, NbAuthService, NbAuthResult } from '@nebular/auth';

@Component({
    selector: 'ngx-logout',
    templateUrl: './logout.component.html',
})

export class LogoutComponent extends NbLogoutComponent {

    constructor(protected service: NbAuthService,
                @Inject(NB_AUTH_OPTIONS) protected options = {},
                protected router: Router,
                private userService: UserService,
               ) {
        super(service, options, router)
    }

    logout(strategy: string): void {
        this.userService.logout()
            .subscribe((res: any) => {
                super.logout(strategy);
            });
    }
}
