import { Pipe, PipeTransform } from '@angular/core';
import { formatMontant } from '../utils/format';

@Pipe({ name: 'montant', standalone: true })
export class MontantPipe implements PipeTransform {
  transform(v: number | null | undefined): string {
    return formatMontant(v);
  }
}
