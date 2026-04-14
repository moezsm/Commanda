import { CustomerForm } from '@/components/customers/CustomerForm'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="Nouveau client" />
      <CustomerForm />
    </div>
  )
}
