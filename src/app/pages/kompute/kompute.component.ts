/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ProjectService, InstanceService, Instance, AdapterService, VolumeService } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { KomputeDialogComponent } from './components/dialog.component';

@Component({
    selector: 'ngx-kompute',
    templateUrl: './kompute.component.html'
})
export class KomputeComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;
    private scanIntervalSeconds = 5;

    private currentProject: string;
    private currentZone: string;

    instances: Instance[] = [];
    instancesStates: any = new Map();
    instancesAdapters: any = new Map();
    instancesVolumes: any = new Map();
    instancesRemoteConnections: any = new Map();

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private projectService: ProjectService,
                private instanceService: InstanceService,
                private adapterService: AdapterService,
                private volumeService: VolumeService,
                private dialogService: NbDialogService) {
    }

    ngOnInit() {
        this.currentProject = this.kowabungaService.currentProject;
        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentProject = this.kowabungaService.currentProject;
                this.getInstances();
            });

        this.currentZone = this.kowabungaService.currentZone;
        this.kowabungaService.onZoneChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentZone = this.kowabungaService.currentZone;
                this.getInstances();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getInstances() {
        if (this.currentProject !== undefined && this.currentZone !== undefined) {
            this.instances.splice(0);
            this.projectService.listProjectZoneInstances(this.currentProject, this.currentZone)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    data.forEach( (iid) => {
                        this.getInstance(iid);
                        setInterval(()=> { this.getInstanceState(iid) }, this.scanIntervalSeconds * 1000);
                    });
                });
        }
    }

    private getInstance(iid: string) {
        this.instanceService.readInstance(iid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.instances, data);
                data.adapters.forEach( (aid) => {
                    this.getAdapter(iid, aid);
                });
                data.volumes.forEach( (vid) => {
                    this.getVolume(iid, vid);
                });
                this.getRemoteConnection(iid);
          });
    }

    private getInstanceState(iid: string) {
        this.instanceService.readInstanceState(iid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.instancesStates.set(iid, data.state);
          });
    }

    private openDialog(title: string, action: string, iid: string, spice_uri: string) {
        this.dialogService.open(KomputeDialogComponent, {
            context: {
                title: title,
                action: action,
                iid: iid,
                spice_url: spice_uri,
            },
        }).onClose.subscribe(state => {
            this.getInstanceState(iid);
        });
    }

    rebootInstance(i: Instance) {
        this.openDialog(`Do you really want to reboot instance ${i.name} ?`, 'REBOOT', i.id, "");
    }

    startInstance(i: Instance) {
        this.openDialog(`Do you really want to power up instance ${i.name} ?`, 'START', i.id, "");
    }

    stopInstance(i: Instance) {
        this.openDialog(`Do you really want to shutdown instance ${i.name} ?`, 'STOP', i.id, "");
    }

    remoteConnect(i: Instance) {
        let rc = this.instancesRemoteConnections.get(i.id);
        let spice_uri = (rc[0]).url
        this.openDialog(`Do you want to remote connect to ${i.name} ?`, 'REMOTE_CONNECT', i.id, spice_uri);
    }

    isInstanceStateOn(iid: string): boolean {
        if (this.instancesStates.has(iid)) {
            if (this.instancesStates.get(iid) === "Running") {
                return true;
            }
        }
        return false;
    }

    getInstanceStateText(iid: string): string {
        if (this.instancesStates.has(iid)) {
            return this.instancesStates.get(iid);
        }
        return "";
    }

    getInstanceStateStatus(iid: string): string {
        if (this.instancesStates.has(iid)) {
            if (this.instancesStates.get(iid) === "Running") {
                return "success";
            }
        }
        return "danger";
    }

    getInstanceStateIcon(iid: string): string {
        if (this.instancesStates.has(iid)) {
            if (this.instancesStates.get(iid) === "Running") {
                return "checkmark-circle-2-outline";
            }
        }
        return "close-circle-outline";
    }

    private getAdapter(iid: string, aid: string) {
        this.adapterService.readAdapter(aid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObjectToMap(this.instancesAdapters, iid, data);
          });
    }

    private getVolume(iid: string, vid: string) {
        this.volumeService.readVolume(vid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObjectToMap(this.instancesVolumes, iid, data);
          });
    }

    private getRemoteConnection(iid: string) {
        this.instanceService.readInstanceRemoteConnection(iid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObjectToMap(this.instancesRemoteConnections, iid, data);
          });
    }
}
