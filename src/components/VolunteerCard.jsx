import { DISTRICTS } from "../data/districts";

export default function VolunteerCard({
  volunteer,
  available,
  assignmentCount,
  matchesPreferredSuburb,
  onAssign,
  onViewProfile,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full shrink-0 ${
            available ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <span className="font-semibold text-brandNavy">{volunteer.name}</span>
        <span className="text-sm text-gray-500">#{volunteer.id}</span>
        {matchesPreferredSuburb && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brandPink/10 text-brandPink">
            Preferred suburb match
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {volunteer.districts.map((d) => (
          <span
            key={d}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brandTeal/10 text-brandTeal"
          >
            {DISTRICTS[d] || d}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-600">
        Assignments: {assignmentCount ?? volunteer.assignmentHistory.length}
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onViewProfile}
          className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition"
        >
          View profile
        </button>
        <button
          type="button"
          onClick={onAssign}
          disabled={!available}
          className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Assign
        </button>
      </div>
    </div>
  );
}
