/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectService, RecordService, DnsRecord } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'ngx-records',
    templateUrl: './records.component.html'
})
export class RecordsComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    private currentProject: string;

    records: DnsRecord[] = [];

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private projectService: ProjectService,
                private recordService: RecordService) {
    }

    ngOnInit() {
        this.currentProject = this.kowabungaService.currentProject;
        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                this.currentProject = this.kowabungaService.currentProject;
                this.records.splice(0);
                this.getProjectRecords();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    private getProjectRecords() {
        this.projectService.listProjectDnsRecords(this.currentProject)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.forEach( (rid) => {
                    this.getRecord(rid);
                });
            });
    }

    private getRecord(rid: string) {
        this.recordService.readDnsRecord(rid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.records, data);
          });
    }
}
