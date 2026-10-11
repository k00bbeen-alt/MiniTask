import { initI18n, t } from '@/framework/i18n/i18n';
import ko from './ko.json';
initI18n({ resources: { ko: { translation: ko } }, fallbackLng: 'ko' });
export { t };
