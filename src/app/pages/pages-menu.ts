/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { NbMenuItem } from '@nebular/theme';

export const MENU_DEFAULT_ITEMS: NbMenuItem[] = [
    {
        title: 'Dashboard',
        icon: 'home-outline',
        link: '/pages/dashboard',
        home: true,
    },
];

export const MENU_ADMIN_ITEMS: NbMenuItem[] = [
    {
        title: 'Kaktus Hypervisors',
        icon: 'layers-outline',
        link: '/pages/kaktus',
    },
];

export const MENU_USER_ITEMS: NbMenuItem[] = [
    {
        title: 'Kawaii Gateways',
        icon: 'cloud-upload-outline',
        link: '/pages/kawaii',
    },
    {
        title: 'Konvey Network LBs',
        icon: 'shuffle-outline',
        link: '/pages/konvey',
    },
    {
        title: 'Kompute Instances',
        icon: 'copy-outline',
        link: '/pages/kompute',
    },
    {
        title: 'Kylo Elastic Volumes',
        icon: 'cube-outline',
        link: '/pages/kylo',
    },
    {
        title: 'Kiwi DNS Records',
        icon: 'at-outline',
        link: '/pages/records',
    },
];
