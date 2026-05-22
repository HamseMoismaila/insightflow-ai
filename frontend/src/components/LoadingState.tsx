export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-200" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-7 w-20 rounded bg-gray-200" />
            <div className="h-3.5 w-32 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-2">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-28 w-full rounded bg-gray-100" />
          <div className="space-y-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-16 w-full rounded bg-gray-50" />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="h-6 w-36 rounded bg-gray-200" />
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 w-full rounded bg-gray-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
