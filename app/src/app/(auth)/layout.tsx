export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-indigo-600">Commanda</h1>
        {children}
      </div>
    </div>
  )
}
