/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';

@Injectable()
export class UtilsService implements OnDestroy {

    private alive = true;

    ngOnDestroy() {
        this.alive = false;
    }

    HumanSize(bytes, si=false, dp=1) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10**dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

        return bytes.toFixed(dp) + ' ' + units[u];
    }

    Round(num: number, fractionDigits: number): number {
        if (num != null) {
            return Number(num.toFixed(fractionDigits));
        }
        return 0;
    }

    IsNonEmptyArray(array: unknown) {
        return Array.isArray(array) && array.length > 0;
    }

    ArrayLength(array: unknown) {
        if (Array.isArray(array) && array.length > 0) {
            return array.length
        }
        return 0;
    }

    sortByName(array: Array<any>) {
        array.sort((a, b) => a.name.localeCompare(b.name));
    }

    addObject(array: Array<any>, obj: any) {
        array.push(obj);
        this.sortByName(array);
    }

    addObjectToMap(m: Map<string, any>, key: string, obj: any) {
        if (!m.has(key)) {
            m.set(key, []);
        }
        let objects = m.get(key);
        this.addObject(objects, obj);
        m.set(key, objects);
    }
}
