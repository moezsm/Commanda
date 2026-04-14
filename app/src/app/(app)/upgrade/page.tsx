import { PageHeader } from '@/components/ui/PageHeader'

export default function UpgradePage() {
  return (
    <div>
      <PageHeader title="Passer en Premium" />
      <div className="px-4 flex flex-col gap-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
          <div className="mb-4 text-4xl">🚀</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Commanda Premium</h2>
          <p className="text-sm text-gray-500 mb-4">
            Débloquez la puissance complète de Commanda pour votre boutique.
          </p>
          <div className="text-left space-y-2 mb-6">
            {[
              'Commandes actives illimitées',
              'Accès équipe (jusqu\'à 3 membres)',
              'Export CSV de commandes et clients',
              'Filtres avancés et recherche améliorée',
              'Mises à jour en masse',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">✓</span> {f}
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-center">
            <p className="text-sm font-semibold text-indigo-800">Lancement bientôt</p>
            <p className="text-xs text-indigo-600 mt-1">Rejoignez la liste d&apos;attente pour être notifié en premier.</p>
            <input
              type="email"
              placeholder="votre@email.com"
              className="mt-3 h-10 w-full rounded-xl border border-indigo-300 px-4 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button className="mt-2 h-10 w-full rounded-xl bg-indigo-600 text-white text-sm font-semibold">
              M&apos;inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
