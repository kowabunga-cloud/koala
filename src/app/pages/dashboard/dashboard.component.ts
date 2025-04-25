/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Project, Zone } from '@kowabunga-cloud/angular';
import { RegionService, ProjectService, ZoneService } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { Netmask } from 'netmask';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'ngx-home',
    styleUrls: ['./dashboard.component.scss'],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    private currentRegion: string;
    public currentRegionName: string;

    private currentZone: string;
    public currentZoneName: string;

    private currentProject: string;
    public currentProjectName: string;

    regionsCount = 0;
    zonesCount = 0;
    kaktusCount = 0;
    poolsCount = 0;
    nfsCount = 0;
    recordsCount = 0;
    instancesCount = 0;
    volumesCount = 0;
    kyloCount = 0;
    cost: any

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private projectService: ProjectService,
                private regionService: RegionService,
                private zoneService: ZoneService) {

    }

    ngOnInit() {
        this.getRegions();
        this.getZones();

        this.currentRegion = this.kowabungaService.currentRegion;
        this.kowabungaService.onRegionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(rid => {
                this.currentRegion = this.kowabungaService.currentRegion;
                this.getRegionName(this.currentRegion);
                this.getRegionStoragePools();
                this.getRegionStorageNfs();
            });

        this.currentZone = this.kowabungaService.currentZone;
        this.kowabungaService.onZoneChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(zid => {
                this.currentZone = this.kowabungaService.currentZone;
                this.getZoneName(this.currentZone);
                this.getZoneKaktuses();
            });

        this.currentProject = this.kowabungaService.currentProject;
        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(zid => {
                this.currentProject = this.kowabungaService.currentProject;
                this.getProjectName(this.currentProject);
                this.getProjectRecords();
                this.getProjectInstances();
                this.getProjectVolumes();
                this.getProjectKylo();
                this.getProjectCost();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getRegionName(rid: string) {
        this.regionService.readRegion(rid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.currentRegionName = data.name;
            });
    }

    private getZoneName(zid: string) {
        this.zoneService.readZone(zid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.currentZoneName = data.name;
            });
    }

    private getProjectName(pid: string) {
        this.projectService.readProject(pid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.currentProjectName = data.name;
            });
    }

    private getRegions() {
        this.regionService.listRegions()
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.regionsCount = data.length;
            });
    }

    private getZones() {
        this.zoneService.listZones()
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.zonesCount = data.length;
            });
    }

    private getZoneKaktuses() {
        if (this.currentZone !== undefined) {
            this.zoneService.listZoneKaktuses(this.currentZone)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.kaktusCount = data.length
                });
        }
    }

    private getRegionStoragePools() {
        if (this.currentRegion !== undefined) {
            this.regionService.listRegionStoragePools(this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.poolsCount = data.length;
                });
        }
    }

    private getRegionStorageNfs() {
        if (this.currentRegion !== undefined) {
            this.regionService.listRegionStorageNFSs(this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.nfsCount = data.length;
                });
        }
    }

    private getProjectRecords() {
        if (this.currentProject !== undefined) {
            this.projectService.listProjectDnsRecords(this.currentProject)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.recordsCount = data.length;
                });
        }
    }

    private getProjectInstances() {
        if (this.currentProject !== undefined && this.currentZone !== undefined) {
            this.projectService.listProjectZoneInstances(this.currentProject, this.currentZone)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.instancesCount = data.length;
                });
        }
    }

    private getProjectVolumes() {
        if (this.currentProject !== undefined && this.currentRegion !== undefined) {
            this.projectService.listProjectRegionVolumes(this.currentProject, this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.volumesCount = data.length;
                });
        }
    }

    private getProjectKylo() {
        if (this.currentProject !== undefined && this.currentRegion !== undefined) {
            this.projectService.listProjectRegionKylos(this.currentProject, this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.kyloCount = data.length;
                });
        }
    }

    private getProjectCost() {
        if (this.currentProject !== undefined) {
            this.projectService.readProjectCost(this.currentProject)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    this.cost = data;
                });
        }
    }
}
