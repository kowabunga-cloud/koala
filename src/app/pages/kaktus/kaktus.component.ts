/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Project, Zone } from '@kowabunga-cloud/angular';
import { RegionService, ZoneService, KaktusService, Kaktus, PoolService, StoragePool, TemplateService, Template, NfsService, StorageNFS, VnetService, VNet, SubnetService, Subnet, AdapterService, Adapter } from '@kowabunga-cloud/angular';
import { UtilsService, KowabungaService } from '../../@core/utils';
import { Netmask } from 'netmask';
import { map, takeWhile, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-kaktus',
  templateUrl: './kaktus.component.html'
})
export class KaktusComponent implements OnDestroy, OnInit {

    private destroy$: Subject<void> = new Subject<void>();
    private alive = true;

    private currentRegion: string;
    private currentZone: string;

    // Kaktuses
    kaktuses: Kaktus[] = [];
    kaktusesCaps: any = new Map();
    kaktusesInstances: any = new Map();

    // Block Storage Pools
    pools: StoragePool[] = [];
    poolsVolumes: any = new Map();
    poolsTemplates: any = new Map();

    // NFS Storage Pools
    nfs: StorageNFS[] = [];
    nfsVolumes: any = new Map();

    // Virtual Networks
    vnets: VNet[] = [];
    vnetsSubnets: any = new Map();
    subnetsSize: any = new Map();
    subnetsAllocated: any = new Map();

    constructor(public utilsService: UtilsService,
                private kowabungaService: KowabungaService,
                private regionService: RegionService,
                private zoneService: ZoneService,
                private kaktusService: KaktusService,
                private poolService: PoolService,
                private templateService: TemplateService,
                private nfsService: NfsService,
                private vnetService: VnetService,
                private subnetService: SubnetService,
                private adapterService: AdapterService) {

    }

    ngOnInit() {
        this.currentRegion = this.kowabungaService.currentRegion;
        this.kowabungaService.onRegionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(rid => {
                this.currentRegion = this.kowabungaService.currentRegion;
                this.getRegionPools();
                this.getRegionNfsStorages();
                this.getRegionVirtualNetworks();
            });

        this.currentZone = this.kowabungaService.currentZone;
        this.kowabungaService.onZoneChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(zid => {
                this.currentZone = this.kowabungaService.currentZone;
                this.getZoneKaktuses();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.alive = false;
    }

    // Kaktuses

    private getZoneKaktuses() {
        this.zoneService.listZoneKaktuses(this.currentZone)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.forEach( (kid) => {
                    //console.log("Kaktus:", kid);
                    this.getKaktus(kid);
                    this.getKaktusCaps(kid);
                    this.getKaktusInstances(kid);
                });
            });
    }

    private getKaktus(kid: string) {
        this.kaktusService.readKaktus(kid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.kaktuses, data);
                //console.log("Kaktus:", data);
          });
    }

    private getKaktusCaps(kid: string) {
        this.kaktusService.readKaktusCaps(kid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("KaktusCaps:", data);
                this.kaktusesCaps.set(kid, data);
          });
    }

    private getKaktusInstances(kid: string) {
        this.kaktusService.listKaktusInstances(kid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("Kaktus Instances:", data.length);
                this.kaktusesInstances.set(kid, data.length);
          });
    }

    // Block Storage Pools

    private getRegionPools() {
        this.regionService.listRegionStoragePools(this.currentRegion)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.forEach( (pid) => {
                    this.getPool(pid);
                    this.getPoolVolumes(pid);
                    this.getPoolTemplates(pid);
                });
            });
    }

    private getPool(pid: string) {
        this.poolService.readStoragePool(pid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.pools, data);
                //console.log("Pool:", data);
          });
    }

    private getPoolVolumes(pid: string) {
        this.poolService.listStoragePoolVolumes(pid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.poolsVolumes.set(pid, data.length);
          });
    }

    private getPoolTemplates(pid: string) {
        this.poolService.listStoragePoolTemplates(pid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("Pool Templates: ", data);
                data.forEach( (tid) => {
                    this.getTemplate(pid, tid);
                });
          });
    }

    private getTemplate(pid: string, tid: string) {
        this.templateService.readTemplate(tid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("Template: ", data);
                this.utilsService.addObjectToMap(this.poolsTemplates, pid, data);
          });
    }

    // NFS Storage Pools

    private getRegionNfsStorages() {
        this.regionService.listRegionStorageNFSs(this.currentRegion)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.forEach( (nid) => {
                    this.getNfsStorage(nid);
                    this.getNfsStorageVolumes(nid);
                });
            });
    }

    private getNfsStorage(nid: string) {
        this.nfsService.readStorageNFS(nid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.nfs, data);
          });
    }

    private getNfsStorageVolumes(nid: string) {
        this.nfsService.listStorageNFSKylos(nid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.nfsVolumes.set(nid, data.length);
          });
    }

    // Virtual Networks

    private getRegionVirtualNetworks() {
        this.regionService.listRegionVNets(this.currentRegion)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.forEach( (vid) => {
                    this.getVirtualNetwork(vid);
                    this.getVirtualNetworkSubnets(vid);
                });
            });
    }

    private getVirtualNetwork(vid: string) {
        this.vnetService.readVNet(vid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.utilsService.addObject(this.vnets, data);
                //console.log("Virtual Network:", data);
          });
    }

    private getVirtualNetworkSubnets(vid: string) {
        this.vnetService.listVNetSubnets(vid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                data.forEach( (sid) => {
                    this.getSubnet(vid, sid);
                });
          });
    }

    private getSubnet(vid: string, sid: string) {
        this.subnetService.readSubnet(sid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("Subnet: ", data);
                this.utilsService.addObjectToMap(this.vnetsSubnets, vid, data);
                let block = new Netmask(data.cidr);
                this.subnetsSize.set(sid, block.size);
                this.subnetsAllocated.set(sid, 0);
                this.getSubnetAdapters(sid);
          });
    }

    getSubnetState(priv: boolean): string {
        return priv ? "Private" : "Public";
    }

    private getSubnetAdapters(sid: string) {
        this.subnetService.listSubnetAdapters(sid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("Adapters: ", data);
                data.forEach( (aid) => {
                    this.getAdapter(sid, aid);
                });
          });
    }

    private getAdapter(sid: string, aid: string) {
        this.adapterService.readAdapter(aid)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                //console.log("Adapter: ", data);
                let allocated = this.subnetsAllocated.get(sid);
                this.subnetsAllocated.set(sid, allocated + this.utilsService.ArrayLength(data.addresses));
          });
    }

}
