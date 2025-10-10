import { useI18n } from '@/hooks/useI18n';

export function HomePage() 
{
  const { t } = useI18n();
    
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="font-heading text-4xl font-bold text-text-primary">
          {t('dashboard.welcome')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('dashboard.placeholder')}
        </p>
      </div>
    </div>
  );
}
