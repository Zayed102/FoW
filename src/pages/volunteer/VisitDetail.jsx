import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DISTRICTS } from "../../data/districts";
import { formatDateTime } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const OUTCOME_OPTIONS = [
  {
    value: "completed_ok",
    label: "Completed normally",
    desc: "Meal delivered, requestor well",
  },
  {
    value: "concern_flagged",
    label: "Completed with concern",
    desc: "Flag for follow-up",
  },
  {
    value: "unable_to_complete",
    label: "Could not complete the visit",
    desc: "",
  },
];

const OUTCOME_STYLES = {
  completed_ok: "bg-green-100 text-green-700",
  concern_flagged: "bg-amber-100 text-amber-700",
  unable_to_complete: "bg-red-100 text-red-700",
};

const OUTCOME_LABELS = {
  completed_ok: "Completed OK",
  concern_flagged: "Concern Flagged",
  unable_to_complete: "Unable to Complete",
};

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    requests,
    currentVolunteerId,
    updateVisitStatus,
    cancelVisit,
    recordOutcome,
    pushToast,
  } = useApp();

  const request = requests.find(
    (r) => r.id === id && r.assignedVolunteerId === currentVolunteerId
  );

  const [showCancel, setShowCancel] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeType, setOutcomeType] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  if (!request) {
    return (
      <div>
        <Link
          to="/volunteer/visits"
          className="inline-flex items-center gap-1 text-sm text-brandPink hover:underline min-h-10"
        >
          <ArrowLeft className="w-4 h-4" /> My visits
        </Link>
        <EmptyState
          icon={Search}
          title="Visit not found"
          message="This visit doesn't exist or isn't assigned to you"
        />
      </div>
    );
  }

  function handleStart() {
    updateVisitStatus(id, "ongoing");
    pushToast("Visit started", "info");
  }

  function handleConfirmCancel() {
    cancelVisit(id);
    setShowCancel(false);
    pushToast("Visit cancelled. Coordinator notified.", "info");
    navigate("/volunteer/visits");
  }

  function handleSubmitOutcome() {
    recordOutcome(id, {
      type: outcomeType,
      notes: outcomeNotes,
      recordedAt: new Date().toISOString(),
    });
    updateVisitStatus(id, "completed");
    setShowOutcome(false);
    pushToast(
      outcomeType !== "completed_ok"
        ? "Welfare alert raised"
        : "Visit completed",
      outcomeType !== "completed_ok" ? "error" : "success"
    );
  }

  const canSubmitOutcome = outcomeType && outcomeNotes.trim().length > 0;
  const showRouteButton =
    request.status === "assigned" || request.status === "ongoing";

  return (
    <div className="w-full">
      <Link
        to="/volunteer/visits"
        className="inline-flex items-center gap-1 text-sm text-brandPink hover:underline min-h-10"
      >
        <ArrowLeft className="w-4 h-4" /> My visits
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold">Visit #{id}</h1>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Requestor
          </h3>
          <p className="font-semibold text-brandNavy">
            {request.requestorName}
          </p>
          <p className="text-sm text-gray-600">{request.requestorPhone}</p>
          <p className="text-sm text-gray-600">{request.address}</p>
          <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brandTeal/10 text-brandTeal">
            {DISTRICTS[request.districtId] || request.districtId}
          </span>

          <hr className="border-t border-gray-200" />

          <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Visit
          </h3>
          <p className="text-sm text-gray-700">
            {formatDateTime(request.visitDate, request.timeSlot)}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
            {request.mealItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {request.status === "completed" && request.outcome && (
            <>
              <hr className="border-t border-gray-200" />
              <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
                Outcome
              </h3>
              <span
                className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  OUTCOME_STYLES[request.outcome.type] || ""
                }`}
              >
                {OUTCOME_LABELS[request.outcome.type] || request.outcome.type}
              </span>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {request.outcome.notes}
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-3">
          {showRouteButton && (
            <button
              type="button"
              onClick={() => navigate(`/volunteer/visits/${id}/route`)}
              className="bg-brandTeal hover:bg-brandTeal/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition inline-flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" /> View route
            </button>
          )}

          {request.status === "assigned" && (
            <>
              <button
                type="button"
                onClick={handleStart}
                className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start visit
              </button>
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition"
              >
                Cancel assignment
              </button>
            </>
          )}

          {request.status === "ongoing" && (
            <>
              <button
                type="button"
                onClick={() => setShowOutcome(true)}
                className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark completed
              </button>
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition"
              >
                Cancel assignment
              </button>
            </>
          )}

          {request.status === "completed" && (
            <p className="text-sm text-gray-600">This visit is completed.</p>
          )}

          {request.status === "cancelled" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              This visit was cancelled.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancel this visit?"
        footer={
          <>
            <button
              type="button"
              onClick={handleConfirmCancel}
              className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition"
            >
              Cancel
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to cancel your assignment for{" "}
          <span className="font-semibold">{request.requestorName}</span>? The
          coordinator will be notified.
        </p>
      </Modal>

      <Modal
        open={showOutcome}
        onClose={() => {
          setShowOutcome(false);
          setOutcomeType("");
          setOutcomeNotes("");
        }}
        title="Record outcome"
        footer={
          <>
            <button
              type="button"
              onClick={handleSubmitOutcome}
              disabled={!canSubmitOutcome}
              className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOutcome(false);
                setOutcomeType("");
                setOutcomeNotes("");
              }}
              className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition"
            >
              Cancel
            </button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2">
          {OUTCOME_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`bg-white border rounded-lg p-3 min-h-10 cursor-pointer flex items-start gap-3 transition hover:border-brandPink/40 ${
                outcomeType === opt.value
                  ? "ring-2 ring-brandPink border-brandPink"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="outcome"
                value={opt.value}
                checked={outcomeType === opt.value}
                onChange={() => setOutcomeType(opt.value)}
                className="mt-0.5 accent-brandPink"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-brandNavy">
                  {opt.label}
                </span>
                {opt.desc && (
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                )}
              </span>
            </label>
          ))}
        </fieldset>

        <label className="block mt-4">
          <span className="text-sm font-medium text-brandNavy">Notes</span>
          <textarea
            rows={4}
            required
            value={outcomeNotes}
            onChange={(e) => setOutcomeNotes(e.target.value)}
            placeholder="Describe what happened..."
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandPink/40 focus:border-brandPink transition"
          />
        </label>
      </Modal>
    </div>
  );
}
