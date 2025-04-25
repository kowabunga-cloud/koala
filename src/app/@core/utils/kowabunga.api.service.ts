/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@angular/core';
import {
    AdapterService,
    AgentService,
    InstanceService,
    KaktusService,
    KawaiiService,
    KiwiService,
    KomputeService,
    KonveyService,
    KyloService,
    NfsService,
    PoolService,
    ProjectService,
    RecordService,
    RegionService,
    SubnetService,
    TeamService,
    TemplateService,
    TokenService,
    UserService,
    VnetService,
    VolumeService,
    ZoneService,
} from '@kowabunga-cloud/angular';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Configuration, ConfigurationParameters } from '@kowabunga-cloud/angular';

@Injectable()
export class KowabungaApiService {
    constructor(private adapterService: AdapterService,
                private agentService: AgentService,
                private instanceService: InstanceService,
                private kaktusService: KaktusService,
                private kawaiiService: KawaiiService,
                private kiwiService: KiwiService,
                private komputeService: KomputeService,
                private konveyService: KonveyService,
                private kyloService: KyloService,
                private nfsService: NfsService,
                private poolService: PoolService,
                private projectService: ProjectService,
                private recordService: RecordService,
                private regionService: RegionService,
                private subnetService: SubnetService,
                private teamService: TeamService,
                private templateService: TemplateService,
                private tokenService: TokenService,
                private userService: UserService,
                private vnetService: VnetService,
                private volumeService: VolumeService,
                private zoneService: ZoneService,
                private authService: NbAuthService) {

        this.authService.getToken()
            .subscribe((token: NbAuthJWTToken) => {
                this.setApiToken(token);
            });

        this.authService.onTokenChange()
            .subscribe((token: NbAuthJWTToken) => {
                this.setApiToken(token);
            });
    }

    private setApiToken(token) {
        let bearer: string = '';
        if (token.isValid()) {
            bearer = token.toString();
        }

        const params: ConfigurationParameters = {
            basePath: '/api/v1',
            credentials: {
                "BearerAuth": bearer,
            }
        }
        var cfg = new Configuration(params);

        this.adapterService.configuration = cfg;
        this.agentService.configuration = cfg;
        this.instanceService.configuration = cfg;
        this.kaktusService.configuration = cfg;
        this.kawaiiService.configuration = cfg;
        this.kiwiService.configuration = cfg;
        this.komputeService.configuration = cfg;
        this.konveyService.configuration = cfg;
        this.kyloService.configuration = cfg;
        this.nfsService.configuration = cfg;
        this.poolService.configuration = cfg;
        this.projectService.configuration = cfg;
        this.recordService.configuration = cfg;
        this.regionService.configuration = cfg;
        this.subnetService.configuration = cfg;
        this.teamService.configuration = cfg;
        this.templateService.configuration = cfg;
        this.tokenService.configuration = cfg;
        this.userService.configuration = cfg;
        this.vnetService.configuration = cfg;
        this.volumeService.configuration = cfg;
        this.zoneService.configuration = cfg;
    }
}
