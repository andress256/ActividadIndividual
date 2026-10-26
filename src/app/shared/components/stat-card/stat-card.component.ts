import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';

/**
 * Widget estadístico reutilizable: muestra una cifra con su etiqueta.
 *
 * Si `selectable` es true se comporta como un botón y emite `selected` al
 * pulsarlo (por ejemplo, para filtrar el dashboard por ese valor).
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgTemplateOutlet, IonIcon],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  /** Texto secundario opcional (p. ej. porcentaje del total). */
  readonly hint = input('');
  /** Variable CSS del color de acento. */
  readonly accent = input('var(--ion-color-primary)');
  /** Nombre del icono de Ionicons (opcional). */
  readonly icon = input('');
  readonly selectable = input(false);
  /** Marca la tarjeta como filtro activo. */
  readonly active = input(false);
  readonly selected = output<void>();
}
