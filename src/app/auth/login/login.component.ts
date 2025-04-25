/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from '@angular/core';
import { NbLoginComponent } from '@nebular/auth';

@Component({
    selector: 'ngx-login',
    templateUrl: './login.component.html',
})

export class LoginComponent extends NbLoginComponent {}
