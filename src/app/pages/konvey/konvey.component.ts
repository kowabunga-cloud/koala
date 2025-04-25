/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectService, KonveyService, Konvey } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'ngx-konvey',
    templateUrl: './konvey.component.html'
})
export class KonveyComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    private currentProject: string;
    private currentRegion: string;

    konvey: Konvey[] = [];

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private projectService: ProjectService,
                private konveyService: KonveyService) {
    }

    ngOnInit() {
        this.currentProject = this.kowabungaService.currentProject;
        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentProject = this.kowabungaService.currentProject;
                this.getKonveys();
            });

        this.currentRegion = this.kowabungaService.currentRegion;
        this.kowabungaService.onRegionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentRegion = this.kowabungaService.currentRegion;
                this.getKonveys();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getKonveys() {
        if (this.currentProject !== undefined && this.currentRegion !== undefined) {
            this.konvey.splice(0);
            this.projectService.listProjectRegionKonveys(this.currentProject, this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    data.forEach( (kid) => {
                        this.getKonvey(kid);
                    });
                });
        }
    }

    private getKonvey(kid: string) {
        this.konveyService.readKonvey(kid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.konvey, data);
          });
    }
}
