/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { UserService, User } from '@kowabunga-cloud/angular';
import { NbAuthJWTToken, NbAuthService, NB_AUTH_OPTIONS, getDeepFromObject } from '@nebular/auth';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'ngx-user',
    templateUrl: './user.component.html'
})
export class UserComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    user: User = {
        name: '',
        role: 'user',
        email: '',
        notifications: false,
    };

    constructor(private authService: NbAuthService,
                @Inject(NB_AUTH_OPTIONS) protected options = {},
                private userService: UserService) {
    }

    ngOnInit() {
        this.authService.getToken()
            .subscribe((token: NbAuthJWTToken) => {
                this.getUser(token.getPayload()['uid']);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getUser(uid: string) {
        this.userService.readUser(uid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.user = data;
          });
    }

    public updateUser(valid: boolean) {
        if (valid) {
            this.userService.updateUser(this.user.id, this.user)
                .subscribe(data => {
                    this.user = data;
                });
        }
    }

    getConfigValue(key: string): any {
        return getDeepFromObject(this.options, key, null);
    }
}
