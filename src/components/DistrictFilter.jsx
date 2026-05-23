import { useApp } from "../context/AppContext";
import { DISTRICTS } from "../data/districts";
import { MapPin, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function DistrictFilter() {
  const { activeDistrict, setActiveDistrict } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options = [{ value: "all", label: "All Districts" }, ...Object.entries(DISTRICTS).map(([k, v]) => ({ value: k, label: v }))];
  const current = options.find((o) => o.value === activeDistrict);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hidden md:flex items-center gap-1.5 px-3 min-h-10 rounded-lg border border-gray-200 text-sm text-brandNavy hover:bg-gray-50 transition"
      >
        <MapPin className="w-4 h-4 text-brandTeal" />
        <span>{current?.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center justify-center min-h-10 min-w-10 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        aria-label="Filter by district"
      >
        <MapPin className="w-4.5 h-4.5 text-brandTeal" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setActiveDistrict(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 min-h-10 flex items-center text-sm hover:bg-cream transition ${
                activeDistrict === opt.value ? "text-brandTeal font-semibold" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
