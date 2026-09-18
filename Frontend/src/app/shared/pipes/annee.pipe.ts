import { Pipe, PipeTransform } from '@angular/core';
import { formatAnnee } from '../utils/format';

@Pipe({ name: 'annee', standalone: true })
export class AnneePipe implements PipeTransform {
  transform(d: Date | string | null | undefined): string {
    return formatAnnee(d);
  }
}
