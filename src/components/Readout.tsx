export function Readout({ label, symbol, value }: { label: string; symbol?: string; value: string }) {
  return (
    <div className="readout">
      <div className="k">{label}</div>
      <div className="v">
        {symbol && <span className="sym">{symbol}</span>}
        {value}
      </div>
    </div>
  )
}
