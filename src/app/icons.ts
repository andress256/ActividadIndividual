import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  barChartOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  downloadOutline,
  flashOutline,
  gridOutline,
  helpCircleOutline,
  layersOutline,
  listOutline,
  lockClosedOutline,
  logInOutline,
  logOutOutline,
  personOutline,
  pulseOutline,
  refreshOutline,
  searchOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from 'ionicons/icons';

/**
 * Registra los iconos usados en la app. En Ionic standalone hay que
 * registrarlos explícitamente; así solo se incluyen en el bundle los usados.
 */
export function registerIcons(): void {
  addIcons({
    'add-circle-outline': addCircleOutline,
    'alert-circle-outline': alertCircleOutline,
    'bar-chart-outline': barChartOutline,
    'checkmark-circle-outline': checkmarkCircleOutline,
    'document-text-outline': documentTextOutline,
    'download-outline': downloadOutline,
    'flash-outline': flashOutline,
    'grid-outline': gridOutline,
    'help-circle-outline': helpCircleOutline,
    'layers-outline': layersOutline,
    'list-outline': listOutline,
    'lock-closed-outline': lockClosedOutline,
    'log-in-outline': logInOutline,
    'log-out-outline': logOutOutline,
    'person-outline': personOutline,
    'pulse-outline': pulseOutline,
    'refresh-outline': refreshOutline,
    'search-outline': searchOutline,
    'shield-checkmark-outline': shieldCheckmarkOutline,
    'time-outline': timeOutline,
  });
}
