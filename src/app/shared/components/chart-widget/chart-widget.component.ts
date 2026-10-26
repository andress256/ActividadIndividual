import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

// Registro explícito: solo se incluyen en el bundle los elementos usados.
Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export type ChartWidgetType = 'bar' | 'doughnut' | 'line';

/**
 * Gráfico reutilizable basado en Chart.js.
 *
 * Recibe etiquetas, valores y colores por `@Input`, se actualiza cuando
 * cambian y emite `segmentSelected` con la etiqueta pulsada. Incluye una
 * tabla oculta visualmente con los mismos datos para lectores de pantalla.
 */
@Component({
  selector: 'app-chart-widget',
  standalone: true,
  templateUrl: './chart-widget.component.html',
  styleUrl: './chart-widget.component.scss',
})
export class ChartWidgetComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly type = input<ChartWidgetType>('bar');
  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly colors = input<string[]>([]);
  readonly segmentSelected = output<string>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    // Actualiza el gráfico existente cuando cambian los datos de entrada.
    effect(() => {
      const labels = this.labels();
      const values = this.values();
      const colors = this.resolvedColors();
      if (!this.chart) return;
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.data.datasets[0].backgroundColor = colors;
      this.chart.data.datasets[0].borderColor = this.type() === 'line' ? colors[0] : colors;
      this.chart.update();
    });
  }

  ngAfterViewInit(): void {
    const colors = this.resolvedColors();
    const text = getComputedStyle(document.documentElement)
      .getPropertyValue('--ion-text-color')
      .trim() || '#222';
    this.chart = new Chart(this.canvas().nativeElement, {
      type: this.type(),
      data: {
        labels: this.labels(),
        datasets: [
          {
            label: this.title(),
            data: this.values(),
            backgroundColor: colors,
            borderColor: this.type() === 'line' ? colors[0] : colors,
            borderWidth: this.type() === 'line' ? 3 : 1,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : undefined,
        plugins: {
          legend: { display: this.type() === 'doughnut', labels: { color: text } },
        },
        scales:
          this.type() === 'doughnut'
            ? {}
            : {
                x: { ticks: { color: text } },
                y: { beginAtZero: true, ticks: { color: text, precision: 0 } },
              },
        onClick: (_event, elements) => {
          const index = elements[0]?.index;
          if (index !== undefined) this.segmentSelected.emit(this.labels()[index]);
        },
      },
    });
  }

  ngOnDestroy(): void {
    // Libera el canvas y los listeners de Chart.js para evitar fugas de memoria.
    this.chart?.destroy();
  }

  private resolvedColors(): string[] {
    const styles = getComputedStyle(document.documentElement);
    const base = this.colors().length ? this.colors() : ['var(--ion-color-primary)'];
    // Chart.js dibuja en canvas y no entiende var(--x): se resuelven a su valor.
    return base.map((color) => {
      const match = /^var\((--[\w-]+)\)$/.exec(color);
      return match ? styles.getPropertyValue(match[1]).trim() || '#3880ff' : color;
    });
  }
}
