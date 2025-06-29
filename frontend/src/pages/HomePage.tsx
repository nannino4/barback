export function HomePage() 
{
    return (
        <div className="space-y-6">
            <div className="text-center space-y-4">
                <h1 className="font-heading text-4xl font-bold text-text-primary">
                    Welcome to Barback
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                    The sophisticated inventory management system for cocktail bars. 
                    Built for mobile-first operations with the elegance of a premium speakeasy.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
                <div className="p-6 rounded-lg border border-border bg-background-secondary">
                    <h3 className="font-heading text-xl font-semibold text-gold-primary mb-2">
                        Inventory Management
                    </h3>
                    <p className="text-text-secondary">
                        Track your spirits, wines, and mixers with precision. Monitor stock levels and get alerts when supplies run low.
                    </p>
                </div>
                
                <div className="p-6 rounded-lg border border-border bg-background-secondary">
                    <h3 className="font-heading text-xl font-semibold text-gold-primary mb-2">
                        Mobile Optimized
                    </h3>
                    <p className="text-text-secondary">
                        Designed for touch interactions and perfect for use in dimly lit bar environments.
                    </p>
                </div>
                
                <div className="p-6 rounded-lg border border-border bg-background-secondary">
                    <h3 className="font-heading text-xl font-semibold text-gold-primary mb-2">
                        Team Collaboration
                    </h3>
                    <p className="text-text-secondary">
                        Invite your team members and manage roles with precision. Keep everyone in sync.
                    </p>
                </div>
            </div>
        </div>
    )
}
