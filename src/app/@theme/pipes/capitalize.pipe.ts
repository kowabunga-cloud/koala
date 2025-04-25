/**
 * Copyright (c) The Kowabunga Project
 * Apache License, Version 2.0 (see LICENSE or https://www.apache.org/licenses/LICENSE-2.0.txt)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ngxCapitalize' })
export class CapitalizePipe implements PipeTransform {

  transform(input: string): string {
    return input && input.length
      ? (input.charAt(0).toUpperCase() + input.slice(1).toLowerCase())
      : input;
  }
}
