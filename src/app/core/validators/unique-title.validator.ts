import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, first, map, of, switchMap, timer } from 'rxjs';
import { IncidentRepository } from '../services/incident-repository';

/**
 * Validador asíncrono: consulta la API para comprobar que no existe ya una
 * incidencia con el mismo título.
 *
 * Espera 400 ms antes de consultar (debounce). Angular cancela la
 * suscripción anterior cada vez que cambia el valor, así que nunca se aplica
 * una respuesta obsoleta.
 *
 * @param excludeId Devuelve el id de la incidencia que se está editando, para
 * no compararla consigo misma.
 */
export function uniqueTitleValidator(
  api: IncidentRepository,
  excludeId: () => string | undefined = () => undefined,
): AsyncValidatorFn {
  return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').trim();
    if (!value) return of(null);

    return timer(400).pipe(
      switchMap(() => api.isTitleTaken(value, excludeId())),
      map((taken) => (taken ? { titleTaken: true } : null)),
      // Si la API falla no bloqueamos el formulario; el servidor validaría de nuevo.
      catchError(() => of(null)),
      first(),
    );
  };
}
