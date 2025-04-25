/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMenuService, NbMenuItem, NbSidebarService, NbThemeService } from '@nebular/theme';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Project, Region, Zone, UserService } from '@kowabunga-cloud/angular';
import { LayoutService, UtilsService, KowabungaService, KowabungaApiService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { sha256 } from 'js-sha256';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    private destroy$: Subject<void> = new Subject<void>();
    user: any;
    userMenu: NbMenuItem[] = [
        {
            title: 'Profile',
            icon: 'person-outline',
            link: 'pages/user',
        },
        {
            title: 'Log out',
            icon: 'unlock-outline',
            link: 'auth/logout',
        },
    ];

    projects: Project[] = [];
    currentProject: string;

    regions: Region[] = [];
    currentRegion: string;

    zones: Zone[] = [];
    currentZone: string;

    themes = [
        {
            value: 'default',
            name: 'Light',
        },
        {
            value: 'dark',
            name: 'Dark',
        },
        {
            value: 'cosmic',
            name: 'Cosmic',
        },
    ];

    currentTheme = 'default';

    constructor(private sidebarService: NbSidebarService,
                private menuService: NbMenuService,
                private themeService: NbThemeService,
                private authService: NbAuthService,
                private utils: UtilsService,
                private kowabungaApiService: KowabungaApiService,
                private kowabungaService: KowabungaService,
                private userService: UserService,
                private layoutService: LayoutService) {
    }

    ngOnInit() {
        this.kowabungaService.onAppendProject()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                //console.log(`Header: New Project is ${pid}`);
                this.projects = Array.from(this.kowabungaService.projects.values());
                this.utils.sortByName(this.projects);
                //console.log(`Header: Projects are ${this.projects}`);
            });

        this.kowabungaService.onProjectChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                //console.log(`Header: New Current Project is ${pid}`);
                this.currentProject = this.kowabungaService.currentProject;
            });

        this.kowabungaService.onAppendRegion()
            .pipe(takeUntil(this.destroy$))
            .subscribe(zid => {
                this.regions = Array.from(this.kowabungaService.regions.values());
            });

        this.kowabungaService.onRegionChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(rid => {
                this.currentRegion = this.kowabungaService.currentRegion;
            });

        this.kowabungaService.onAppendZone()
            .pipe(takeUntil(this.destroy$))
            .subscribe(zid => {
                this.zones = Array.from(this.kowabungaService.zones.values());
            });

        this.kowabungaService.onZoneChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(zid => {
                this.currentZone = this.kowabungaService.currentZone;
            });

        this.currentTheme = this.themeService.currentTheme;
        this.themeService.onThemeChange()
            .pipe(
                map(({ name }) => name),
                takeUntil(this.destroy$),
            )
            .subscribe(themeName => this.currentTheme = themeName);

        this.authService.onTokenChange()
            .subscribe((token: NbAuthJWTToken) => {
                if (token.isValid()) {
                    let payload = token.getPayload();
                    this.userService.readUser(payload.uid)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe(data => {
                            const hashedEmail = sha256(data.email);
                            this.user = {
                                name: data.name,
                                picture: `https://www.gravatar.com/avatar/${hashedEmail}`,
                            }
                        });
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    changeProject(pid: string) {
        this.kowabungaService.changeProject(pid);
    }

    changeRegion(rid: string) {
        this.kowabungaService.changeRegion(rid);
    }

    changeZone(zid: string) {
        this.kowabungaService.changeZone(zid);
    }

    changeTheme(themeName: string) {
        this.themeService.changeTheme(themeName);
    }

    toggleSidebar(): boolean {
        this.sidebarService.toggle(true, 'menu-sidebar');
        this.layoutService.changeLayoutSize();

        return false;
    }

    navigateHome() {
        this.menuService.navigateHome();
        return false;
    }
}
