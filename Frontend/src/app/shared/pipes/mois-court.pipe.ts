import { Pipe, PipeTransform } from '@angular/core';
import { formatMoisCourt } from '../utils/format';

@Pipe({ name: 'moisCourt', standalone: true })
export class MoisCourtPipe implements PipeTransform {
  transform(d: Date | string | null | undefined): string {
    return formatMoisCourt(d);
  }
}
