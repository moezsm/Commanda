import { DeliveryCompanyForm } from '@/components/delivery/DeliveryCompanyForm'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NewDeliveryCompanyPage() {
  return (
    <div>
      <PageHeader title="Nouveau transporteur" />
      <DeliveryCompanyForm />
    </div>
  )
}
