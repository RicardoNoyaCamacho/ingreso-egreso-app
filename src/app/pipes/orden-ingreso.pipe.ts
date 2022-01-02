import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'ordenIngreso',
})
export class OrdenIngresoPipe implements PipeTransform {
  transform(items: any[]): any[] {
    return items.sort((a, b) => {
      if (a.tipo === 'ingreso') {
        return -1;
      } else {
        return 1;
      }
    });
  }
}
