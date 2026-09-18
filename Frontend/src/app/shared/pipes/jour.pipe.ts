import { Pipe, PipeTransform } from '@angular/core';
import { formatJour } from '../utils/format';

@Pipe({ name: 'jour', standalone: true })
export class JourPipe implements PipeTransform {
  transform(d: Date | string | null | undefined): string {
    return formatJour(d);
  }
}
