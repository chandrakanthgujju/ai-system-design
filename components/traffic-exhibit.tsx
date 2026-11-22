import { inFlight, trafficCases } from "@/lib/course"

export function TrafficExhibit() {
  return (
    <section className="mt-10">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        In flight while the rate holds
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Requests in flight ≈ arrivals per second × seconds one request occupies a worker. That
        is the number a platform has to hold. Hits per second alone is not.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-paper">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Arrival</th>
              <th className="px-4 py-3 font-normal">Held</th>
              <th className="px-4 py-3 font-normal">In flight</th>
              <th className="px-4 py-3 font-normal">Wait</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trafficCases.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.arrival}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{item.seconds}s</td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {item.rps} × {item.seconds} = {inFlight(item.rps, item.seconds)}
                </td>
                <td className="px-4 py-3">{item.waiting}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
