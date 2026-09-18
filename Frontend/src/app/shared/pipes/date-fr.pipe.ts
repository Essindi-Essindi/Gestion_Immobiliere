import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '../utils/format';

@Pipe({ name: 'dateFr', standalone: true })
export class DateFrPipe implements PipeTransform {
  transform(d: Date | string | null | undefined): string {
    return formatDate(d);
  }
}
