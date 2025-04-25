/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { InstanceService } from '@kowabunga-cloud/angular';

@Component({
    selector: 'ngx-kompute-dialog',
    templateUrl: 'dialog.component.html',
    styleUrls: ['dialog.component.scss'],
})
export class KomputeDialogComponent {

    @Input() title: string;
    @Input() action: string;
    @Input() iid: string;
    @Input() spice_url: string;

    constructor(protected ref: NbDialogRef<KomputeDialogComponent>,
                private instanceService: InstanceService) {}

    cancel() {
        this.ref.close(false);
    }

    reboot() {
        this.instanceService.rebootInstance(this.iid)
            .subscribe(data => {
                console.log("Rebooted instance:", this.iid);
          });
        this.ref.close(true);
    }

    start() {
        this.instanceService.startInstance(this.iid)
            .subscribe(data => {
                console.log("Started instance:", this.iid);
          });
        this.ref.close(true);
    }

    stop() {
        this.instanceService.stopInstance(this.iid)
            .subscribe(data => {
                console.log("Stopped instance:", this.iid);
          });
        this.ref.close(true);
    }

    remoteConnect() {
        console.log("Spice Remote Connection to ", this.spice_url);
        this.ref.close(true);
    }
}
