import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  /**
   * pipe para formatear campos de valor total con moneda
   * @param value 
   * @returns 
   */
  transform(value: number | string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numberValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numberValue)) {
      return '';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numberValue);
  }

}