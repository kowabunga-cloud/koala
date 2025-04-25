/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectService, KyloService, Kylo } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'ngx-kylo',
    templateUrl: './kylo.component.html'
})
export class KyloComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    private currentProject: string;
    private currentRegion: string;

    kylo: Kylo[] = [];

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private projectService: ProjectService,
                private kyloService: KyloService) {
    }

    ngOnInit() {
        this.currentProject = this.kowabungaService.currentProject;
        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentProject = this.kowabungaService.currentProject;
                this.getKyloVolumes();
            });

        this.currentRegion = this.kowabungaService.currentRegion;
        this.kowabungaService.onRegionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentRegion = this.kowabungaService.currentRegion;
                this.getKyloVolumes();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getKyloVolumes() {
        if (this.currentProject !== undefined && this.currentRegion !== undefined) {
            this.kylo.splice(0);
            this.projectService.listProjectRegionKylos(this.currentProject, this.currentRegion)
                .pipe(takeWhile(() => this.alive))
                .subscribe(data => {
                    data.forEach( (kid) => {
                        this.getKylo(kid);
                    });
                });
        }
    }

    private getKylo(rid: string) {
        this.kyloService.readKylo(rid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.kylo, data);
          });
    }
}
