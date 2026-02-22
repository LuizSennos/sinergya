import { patients } from "@/data/patients";

export default function PatientList() {
  return (
    <div className="h-full rounded-2xl bg-slate-800 p-4 shadow-xl">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
        Pacientes
      </h2>

      <ul className="space-y-2">
        {patients.map((p, index) => (
          <li
            key={p.id}
            className={`cursor-pointer rounded-xl p-3 transition-all ${
              index === 0
                ? "bg-slate-700 border-l-4 border-emerald-500 shadow-inner"
                : "hover:bg-slate-700"
            }`}
          >
            <p className="text-sm font-medium text-white">{p.name}</p>
            <p className="text-xs text-slate-400">{p.team}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
