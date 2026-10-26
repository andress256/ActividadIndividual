import { FormControl } from '@angular/forms';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { IncidentRepository } from '../services/incident-repository';
import { uniqueTitleValidator } from './unique-title.validator';

function apiReturning(result: Observable<boolean>) {
  return { isTitleTaken: vi.fn(() => result) } as unknown as IncidentRepository & {
    isTitleTaken: ReturnType<typeof vi.fn>;
  };
}

describe('uniqueTitleValidator', () => {
  it('devuelve titleTaken si la API indica que el título existe', async () => {
    const api = apiReturning(of(true));
    const validator = uniqueTitleValidator(api);
    const result = await firstValueFrom(validator(new FormControl('Fuga de agua')) as Observable<unknown>);
    expect(result).toEqual({ titleTaken: true });
    expect(api.isTitleTaken).toHaveBeenCalledWith('Fuga de agua', undefined);
  });

  it('es válido si el título está libre y pasa el id excluido', async () => {
    const api = apiReturning(of(false));
    const validator = uniqueTitleValidator(api, () => 'INC-007');
    const result = await firstValueFrom(validator(new FormControl('Otro')) as Observable<unknown>);
    expect(result).toBeNull();
    expect(api.isTitleTaken).toHaveBeenCalledWith('Otro', 'INC-007');
  });

  it('no consulta la API con un valor vacío', async () => {
    const api = apiReturning(of(true));
    const result = await firstValueFrom(uniqueTitleValidator(api)(new FormControl('  ')) as Observable<unknown>);
    expect(result).toBeNull();
    expect(api.isTitleTaken).not.toHaveBeenCalled();
  });

  it('no bloquea el formulario si la API falla', async () => {
    const api = apiReturning(throwError(() => new Error('500')));
    const result = await firstValueFrom(uniqueTitleValidator(api)(new FormControl('Título')) as Observable<unknown>);
    expect(result).toBeNull();
  });
});
