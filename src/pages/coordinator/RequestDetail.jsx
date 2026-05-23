import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ExternalLink } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DISTRICTS } from "../../data/districts";
import { formatDateTime, relativeTime, weekdayOf } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import VolunteerCard from "../../components/VolunteerCard";
import Modal from "../../components/Modal";

function timeToMin(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function coversSlot(ranges, slotStart, slotEnd) {
  return ranges.some((r) => {
    const [rs, re] = r.split("-");
    return timeToMin(rs) <= slotStart && timeToMin(re) >= slotEnd;
  });
}

function isVolunteerAvailable(volunteer, request) {
  if (!volunteer.districts.includes(request.districtId)) return false;
  const day = weekdayOf(request.visitDate);
  const [slotStartStr, slotEndStr] = request.timeSlot.split("-");
  const slotStart = timeToMin(slotStartStr);
  const slotEnd = timeToMin(slotEndStr);
  const cw = volunteer.availability.currentWeek?.[day];
  if (cw && cw.length > 0) return coversSlot(cw, slotStart, slotEnd);
  const def = volunteer.availability.default?.[day];
  if (def && def.length > 0) return coversSlot(def, slotStart, slotEnd);
  return false;
}

function computeScore(volunteer, request) {
  const idx = volunteer.suburbRanking?.indexOf(request.suburb) ?? -1;
  let suburbScore;
  if (idx === 0) suburbScore = 10000;
  else if (idx > 0) suburbScore = 5000 - idx * 100;
  else suburbScore = 0;
  const districtBonus = volunteer.preferredDistrict === request.districtId ? 500 : 0;
  const assignmentPenalty = (volunteer.assignmentHistory?.length || 0) * 10;
  return suburbScore + districtBonus - assignmentPenalty;
}

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

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, volunteers, assignVolunteer, pushToast } = useApp();

  const request = requests.find((r) => r.id === id);
  const assignedVol = request?.assignedVolunteerId
    ? volunteers.find((v) => v.id === request.assignedVolunteerId)
    : null;

  const [profileVol, setProfileVol] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);

  const candidates = useMemo(() => {
    if (!request) return [];
    return volunteers
      .map((v) => ({
        vol: v,
        avail: isVolunteerAvailable(v, request),
        score: computeScore(v, request),
        matchesSuburb: v.suburbRanking?.[0] === request.suburb,
      }))
      .filter(({ vol }) => vol.districts.includes(request.districtId))
      .sort((a, b) => {
        if (a.avail !== b.avail) return a.avail ? -1 : 1;
        return b.score - a.score;
      })
      .slice(0, 8);
  }, [request, volunteers]);

  if (!request) {
    return (
      <div>
        <Link
          to="/coordinator/dashboard"
          className="inline-flex items-center gap-1 text-sm text-brandPink hover:underline min-h-10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to requests
        </Link>
        <EmptyState
          icon={Search}
          title="Request not found"
          message="This request doesn't exist or has been removed"
        />
      </div>
    );
  }

  const coords = request.coordinates;
  const chars = request.characteristics;

  function handleOpenAssign(volunteer) {
    setSelectedVolunteer(volunteer);
    setShowAssignModal(true);
  }

  function handleConfirmAssign() {
    assignVolunteer(request.id, selectedVolunteer.id);
    setShowAssignModal(false);
    setSelectedVolunteer(null);
    pushToast("Assigned. Notification sent to volunteer.", "success");
  }

  function handleCloseAssign() {
    setShowAssignModal(false);
    setSelectedVolunteer(null);
  }

  const needsCandidateList =
    request.status === "unassigned" || request.status === "cancelled";

  return (
    <div className="w-full">
      <Link
        to="/coordinator/dashboard"
        className="inline-flex items-center gap-1 text-sm text-brandPink hover:underline min-h-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          Request #{id}
        </h1>
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
          {coords && (
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
                  "_blank",
                  "noopener"
                )
              }
              className="text-sm text-brandPink min-h-10 inline-flex items-center gap-1 self-start hover:underline"
            >
              Open in Maps <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brandTeal/10 text-brandTeal">
            {DISTRICTS[request.districtId] || request.districtId}
          </span>

          {chars && (
            <>
              <hr className="border-t border-gray-200" />
              <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
                Characteristics
              </h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-gray-500">Dietary</dt>
                <dd className="text-gray-700">{chars.dietary}</dd>
                <dt className="text-gray-500">Mobility</dt>
                <dd className="text-gray-700">{chars.mobility}</dd>
                <dt className="text-gray-500">Language</dt>
                <dd className="text-gray-700">{chars.language}</dd>
                {chars.notes && (
                  <>
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="text-gray-700">{chars.notes}</dd>
                  </>
                )}
              </dl>
            </>
          )}

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
              <p className="text-xs text-gray-400">
                Recorded {relativeTime(request.outcome.recordedAt)}
              </p>
            </>
          )}

          {request.status === "cancelled" && (
            <>
              <hr className="border-t border-gray-200" />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                Request cancelled — pick a new volunteer on the right to reassign.
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-3">
          {needsCandidateList && (
            <CandidateList
              candidates={candidates}
              onViewProfile={setProfileVol}
              onAssign={handleOpenAssign}
            />
          )}

          {(request.status === "assigned" || request.status === "ongoing") &&
            assignedVol && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col gap-2">
                  <p className="font-semibold text-green-800">
                    Assigned to {assignedVol.name}
                  </p>
                  <p className="text-sm text-green-700">{assignedVol.phone}</p>
                </div>
                {!showVolunteers && (
                  <button
                    type="button"
                    onClick={() => setShowVolunteers(true)}
                    className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition"
                  >
                    Reassign
                  </button>
                )}
                {showVolunteers && (
                  <CandidateList
                    candidates={candidates}
                    onViewProfile={setProfileVol}
                    onAssign={handleOpenAssign}
                  />
                )}
              </>
            )}

          {request.status === "completed" && assignedVol && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
              <p className="font-semibold text-brandNavy">
                Completed by {assignedVol.name}
              </p>
              <p className="text-sm text-gray-600">{assignedVol.phone}</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!profileVol}
        onClose={() => setProfileVol(null)}
        title={profileVol ? `${profileVol.name} — Profile` : ""}
      >
        {profileVol && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-brandNavy">{profileVol.name}</span>
              <span className="text-sm text-gray-500">#{profileVol.id}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profileVol.districts.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brandTeal/10 text-brandTeal"
                >
                  {DISTRICTS[d] || d}
                </span>
              ))}
            </div>

            {profileVol.characteristics && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-gray-500">Languages</dt>
                <dd className="text-gray-700">{profileVol.characteristics.languages?.join(", ")}</dd>
                <dt className="text-gray-500">Has vehicle</dt>
                <dd className="text-gray-700">{profileVol.characteristics.hasVehicle ? "Yes" : "No"}</dd>
                <dt className="text-gray-500">Can assist mobility</dt>
                <dd className="text-gray-700">{profileVol.characteristics.canAssistMobility ? "Yes" : "No"}</dd>
                {profileVol.characteristics.notes && (
                  <>
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="text-gray-700">{profileVol.characteristics.notes}</dd>
                  </>
                )}
              </dl>
            )}

            <div className="text-sm">
              <p className="text-gray-500">
                Preferred district:{" "}
                <span className="text-gray-700 font-medium">
                  {DISTRICTS[profileVol.preferredDistrict] || profileVol.preferredDistrict}
                </span>
              </p>
              {profileVol.suburbRanking?.[0] && (
                <p className="text-gray-500">
                  Preferred suburb:{" "}
                  <span className="text-gray-700 font-medium">{profileVol.suburbRanking[0]}</span>
                </p>
              )}
            </div>

            <hr className="border-t border-gray-200" />

            <h4 className="text-sm font-semibold text-gray-500">Assignment history</h4>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium">Visit ID</th>
                    <th className="pb-2 font-medium">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {profileVol.assignmentHistory.map((h, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{h.date}</td>
                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{h.visitId}</td>
                      <td className="py-2 capitalize text-gray-700 whitespace-nowrap">
                        {h.outcome.replace(/_/g, " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showAssignModal}
        onClose={handleCloseAssign}
        title="Confirm assignment"
        footer={
          <>
            <button
              type="button"
              onClick={handleConfirmAssign}
              className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={handleCloseAssign}
              className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full sm:w-auto transition"
            >
              Cancel
            </button>
          </>
        }
      >
        {selectedVolunteer && (
          <p className="text-sm text-gray-700">
            Assign <span className="font-semibold">{selectedVolunteer.name}</span> to
            request <span className="font-semibold">#{id}</span>?
          </p>
        )}
      </Modal>
    </div>
  );
}

function CandidateList({ candidates, onViewProfile, onAssign }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-brandNavy">Available volunteers</h3>
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
          {candidates.filter((c) => c.avail).length}
        </span>
      </div>
      {candidates.length === 0 ? (
        <p className="text-sm text-gray-500">
          No volunteers serve this district.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {candidates.map(({ vol, avail, matchesSuburb }) => (
            <VolunteerCard
              key={vol.id}
              volunteer={vol}
              available={avail}
              assignmentCount={vol.assignmentHistory.length}
              matchesPreferredSuburb={matchesSuburb}
              onViewProfile={() => onViewProfile(vol)}
              onAssign={() => onAssign(vol)}
            />
          ))}
        </div>
      )}
    </>
  );
}
