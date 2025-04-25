/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubnetService, ProjectService, KawaiiService, Kawaii } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'ngx-kawaii',
    templateUrl: './kawaii.component.html'
})
export class KawaiiComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    private currentProject: string;
    private currentRegion: string;

    kawaii: Kawaii[] = [];
    kawaiiVpcSubnets: any = new Map();

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private projectService: ProjectService,
                private subnetService: SubnetService,
                private kawaiiService: KawaiiService) {
    }

    ngOnInit() {
        this.currentProject = this.kowabungaService.currentProject;
        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentProject = this.kowabungaService.currentProject;
                this.getKawaiiGateways();
            });

        this.currentRegion = this.kowabungaService.currentRegion;
        this.kowabungaService.onRegionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentRegion = this.kowabungaService.currentRegion;
                this.getKawaiiGateways();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getKawaiiGateways() {
        if (this.currentProject !== undefined && this.currentRegion !== undefined) {
            this.kawaii.splice(0);
            this.projectService.listProjectRegionKawaiis(this.currentProject, this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    data.forEach( (kid) => {
                        this.getKawaii(kid);
                    });
                });
        }
    }

    private getKawaii(kid: string) {
        this.kawaiiService.readKawaii(kid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.ipsec_connections = [];
                this.utilsService.addObject(this.kawaii, data);
                data.vpc_peerings.forEach( (peer) => {
                    this.getSubnet(peer.subnet);
                });
            });
        this.kawaiiService.listKawaiiIpSecs(kid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                if (Array.isArray(data) && data.length) {
                    data.forEach( (iid) => {
                        this.getIPsec(kid, iid);
                    });
                }
            });
    }

    private getSubnet(sid: string) {
        this.subnetService.readSubnet(sid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObjectToMap(this.kawaiiVpcSubnets, sid, data);
          });
    }

    private getIPsec(kid: string, iid: string) {
        this.kawaiiService.readKawaiiIpSec(kid, iid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.kawaii.forEach ( (k) => {
                    if (k.id == kid) {
                        this.utilsService.addObject(k.ipsec_connections, data);
                    }
                });
          });
    }
}
