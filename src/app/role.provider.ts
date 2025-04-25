/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import { NbRoleProvider } from '@nebular/security';

@Injectable()
export class RoleProvider implements NbRoleProvider {

    constructor(private authService: NbAuthService) {}

    getRole(): Observable<string> {
        return this.authService.onTokenChange()
            .pipe(
                map((token: NbAuthJWTToken) => {
                    return token.isValid() ? token.getPayload()['role'] : 'user';
                }),
            );
    }
}
