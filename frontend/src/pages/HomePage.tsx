import { useI18n } from '@/hooks/useI18n';

export function HomePage() 
{
  const { t } = useI18n();
    
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="font-heading text-4xl font-bold text-text-primary">
          {t('home.welcome')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('home.description')}
        </p>
      </div>
            
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
        <div className="p-6 rounded-lg border border-border bg-background-secondary">
          <h3 className="font-heading text-xl font-semibold text-gold-primary mb-2">
            {t('home.features.inventory.title')}
          </h3>
          <p className="text-text-secondary">
            {t('home.features.inventory.description')}
          </p>
        </div>
                
        <div className="p-6 rounded-lg border border-border bg-background-secondary">
          <h3 className="font-heading text-xl font-semibold text-gold-primary mb-2">
            {t('home.features.mobile.title')}
          </h3>
          <p className="text-text-secondary">
            {t('home.features.mobile.description')}
          </p>
        </div>
                
        <div className="p-6 rounded-lg border border-border bg-background-secondary">
          <h3 className="font-heading text-xl font-semibold text-gold-primary mb-2">
            {t('home.features.team.title')}
          </h3>
          <p className="text-text-secondary">
            {t('home.features.team.description')}
          </p>
        </div>
      </div>
    </div>
  )
}
