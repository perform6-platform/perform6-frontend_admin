export default function Devices() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Devices</h2>
        <button
          type="button"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"
        >
          Add device (pairing code)
        </button>
      </div>
      <p className="mt-4 text-slate-600">
        Pairing codes for BrightSign players — API integration in Milestone 3.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-400">
        No devices yet
      </div>
    </div>
  );
}
