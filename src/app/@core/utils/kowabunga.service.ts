/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@angular/core';
import { of as observableOf, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { UtilsService } from '../../@core/utils';
import { ProjectService, Project, RegionService, Region, ZoneService, Zone } from '@kowabunga-cloud/angular';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

@Injectable()
export class KowabungaService {

    projects: any = new Map();
    currentProject: string;
    private projectChanges$ = new ReplaySubject(1);
    private appendProject$ = new Subject();

    regions: any = new Map();
    currentRegion: string;
    private regionChanges$ = new ReplaySubject(1);
    private appendRegion$ = new Subject();

    zones: any = new Map();
    currentZone: string;
    private zoneChanges$ = new ReplaySubject(1);
    private appendZone$ = new Subject();

    constructor(private authService: NbAuthService,
                private projectService: ProjectService,
                private regionService: RegionService,
                private zoneService: ZoneService,
                private utils: UtilsService) {

        this.authService.onTokenChange()
            .subscribe((token: NbAuthJWTToken) => {
                if (token.isValid()) {
                    this.retrieveAllProjects();
                    this.retrieveAllRegions();
                    this.retrieveAllZones();
                }
            });
    }

    // PROJECTS

    private retrieveAllProjects() {
        this.projectService.listProjects()
            .subscribe(data => {
                //console.log(`KowabungaService: found projects '${data}'`);
                data.forEach( (pid) => {
                    this.retrieveProject(pid);
                });
            });
    }

    private retrieveProject(pid: string) {
        this.projectService.readProject(pid)
            .subscribe(data => {
                //console.log(`KowabungaService: Project ${pid} content retrived: ${data}`);
                this.appendProject(pid, data);
                if (this.currentProject === undefined) {
                    //console.log("New current project:", pid, data);
                    this.changeProject(pid);
                    //this.currentProject = data.id;
                    //this.projectChanges$.next({ data.idpid, previous: this.currentProject });
                }
            });
    }

    private appendProject(pid: string, data: Project) {
        this.projects.set(pid, data);
        this.appendProject$.next(pid);
        //console.log(`KowabungaService: appendProject '${pid}'`);
    }

    onProjectChange(): Observable<any> {
        return this.projectChanges$.pipe(share());
    }

    changeProject(pid: string) {
        this.currentProject = pid;
        this.projectChanges$.next(pid);
    }

    onAppendProject(): Observable<any> {
        return this.appendProject$.pipe(share());
    }

    getCurrentProject(): Observable<Project> {
        return this.onProjectChange().pipe(
            map((pid: any) => {
                if (!this.projects.has(pid)) {
                    throw Error(`KowabungaService: no project '${pid}' found`);
                }
                return this.projects.get(pid);
            }),
        );
    }

    getProjects(): Observable<Project> {
        return observableOf(this.projects);
    }

    // REGIONS

    private retrieveAllRegions() {
        this.regionService.listRegions()
            .subscribe(data => {
                data.forEach( (rid) => {
                    this.retrieveRegion(rid);
                });
            });
    }

    private retrieveRegion(rid: string) {
        this.regionService.readRegion(rid)
            .subscribe(data => {
                this.appendRegion(rid, data);
                if (this.currentRegion === undefined) {
                    this.changeRegion(rid);
                }
            });
    }

    private appendRegion(rid: string, data: Zone) {
        this.regions.set(rid, data);
        this.appendRegion$.next(rid);
    }

    onRegionChange(): Observable<any> {
        return this.regionChanges$.pipe(share());
    }

    changeRegion(rid: string) {
        this.currentRegion = rid;
        this.regionChanges$.next(rid);
    }

    onAppendRegion(): Observable<any> {
        return this.appendRegion$.pipe(share());
    }

    getCurrentRegion(): Observable<Zone> {
        return this.onRegionChange().pipe(
            map((rid: any) => {
                if (!this.regions.has(rid)) {
                    throw Error(`KowabungaService: no region '${rid}' found`);
                }
                return this.regions.get(rid);
            }),
        );
    }

    getRegions(): Observable<Zone> {
        return observableOf(this.regions);
    }

    // ZONES

    private retrieveAllZones() {
        this.zoneService.listZones()
            .subscribe(data => {
                data.forEach( (zid) => {
                    this.retrieveZone(zid);
                });
            });
    }

    private retrieveZone(zid: string) {
        this.zoneService.readZone(zid)
            .subscribe(data => {
                this.appendZone(zid, data);
                if (this.currentZone === undefined) {
                    this.changeZone(zid);
                }
            });
    }

    private appendZone(zid: string, data: Zone) {
        this.zones.set(zid, data);
        this.appendZone$.next(zid);
    }

    onZoneChange(): Observable<any> {
        return this.zoneChanges$.pipe(share());
    }

    changeZone(zid: string) {
        this.currentZone = zid;
        this.zoneChanges$.next(zid);
    }

    onAppendZone(): Observable<any> {
        return this.appendZone$.pipe(share());
    }

    getCurrentZone(): Observable<Zone> {
        return this.onZoneChange().pipe(
            map((zid: any) => {
                if (!this.zones.has(zid)) {
                    throw Error(`KowabungaService: no zone '${zid}' found`);
                }
                return this.zones.get(zid);
            }),
        );
    }

    getZones(): Observable<Zone> {
        return observableOf(this.zones);
    }
}
