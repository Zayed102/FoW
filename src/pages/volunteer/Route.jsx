import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Phone } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DISTRICTS } from "../../data/districts";
import { formatDateTime } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

const WAYPOINTS = {
  Bondi: [
    "Head east on Oxford St toward Bondi Junction",
    "Continue onto Bondi Rd past Waverley Park",
    "Turn left onto Bondi Rd at Bondi Beach roundabout",
    "Arrive at destination on the left",
  ],
  Coogee: [
    "Head south on Anzac Pde toward Kingsford",
    "Turn left onto Rainbow St",
    "Continue onto Coogee Bay Rd past Grant Reserve",
    "Arrive at destination on the right",
  ],
  Randwick: [
    "Head south on Anzac Pde",
    "Turn right onto Belmore Rd near Randwick Racecourse",
    "Continue for 400 m past the hospital",
    "Arrive at destination on the left",
  ],
  Newtown: [
    "Head west on Cleveland St toward Redfern",
    "Turn left onto King St at the intersection",
    "Continue south through Newtown village",
    "Arrive at destination on the right",
  ],
  Marrickville: [
    "Head south on Enmore Rd toward Marrickville",
    "Turn right onto Marrickville Rd",
    "Continue for 600 m past Henson Park",
    "Arrive at destination on the left",
  ],
  Leichhardt: [
    "Head west on Parramatta Rd",
    "Turn left onto Norton St at Leichhardt Town Hall",
    "Continue past the Italian Forum",
    "Arrive at destination on the right",
  ],
  Chatswood: [
    "Head north on the Pacific Hwy",
    "Exit onto Victoria Ave toward Chatswood CBD",
    "Continue past Chatswood Chase",
    "Arrive at destination on the left",
  ],
  "Crows Nest": [
    "Head north on the Pacific Hwy past St Leonards",
    "Turn right onto Willoughby Rd",
    "Continue through Crows Nest village",
    "Arrive at destination on the right",
  ],
  "Lane Cove": [
    "Head north on Epping Rd",
    "Turn right onto Longueville Rd at Lane Cove",
    "Continue past Lane Cove Plaza",
    "Arrive at destination on the left",
  ],
  Maroubra: [
    "Head south on Anzac Pde past Kensington",
    "Continue through Maroubra Junction",
    "Turn left onto Anzac Pde at the roundabout",
    "Arrive at destination on the right",
  ],
  Mosman: [
    "Head north on Military Rd from Neutral Bay",
    "Continue through Mosman village",
    "Pass Mosman Junction on the right",
    "Arrive at destination on the left",
  ],
  "North Sydney": [
    "Head north across the Harbour Bridge",
    "Take the Pacific Hwy exit toward North Sydney",
    "Continue on Pacific Hwy past North Sydney station",
    "Arrive at destination on the right",
  ],
};

const FALLBACK_WAYPOINTS = [
  "Head north on the main road",
  "Continue for 2 km",
  "Turn right onto the destination street",
  "Arrive at destination",
];

function getSuburb(address) {
  const match = address.match(/, ([A-Za-z ]+) NSW/);
  return match ? match[1].trim() : null;
}

function getWaypoints(address) {
  const suburb = getSuburb(address);
  return (suburb && WAYPOINTS[suburb]) || FALLBACK_WAYPOINTS;
}

export default function VisitRoute() {
  const { id } = useParams();
  const { requests, currentVolunteerId } = useApp();

  const request = requests.find(
    (r) => r.id === id && r.assignedVolunteerId === currentVolunteerId
  );

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

  const { coordinates, address, requestorPhone } = request;
  const lat = coordinates?.lat;
  const lng = coordinates?.lng;

  const hash = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const distanceKm = (3 + (hash % 18) + (hash % 7) / 10).toFixed(1);
  const etaMin = 8 + (hash % 35);

  const waypoints = getWaypoints(address);

  return (
    <div className="w-full">
      <Link
        to={`/volunteer/visits/${id}`}
        className="inline-flex items-center gap-1 text-sm text-brandPink hover:underline min-h-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back to visit
      </Link>

      <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
        Route to {request.requestorName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-3 md:p-4 flex flex-col gap-3">
          {lat && lng ? (
            <iframe
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              className="w-full h-64 md:h-96 rounded-xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing ${address}`}
            />
          ) : (
            <div className="w-full h-64 md:h-96 rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
              Map unavailable
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm text-gray-600 break-words">{address}</p>

            <div className="flex gap-2 flex-col sm:flex-row">
              {lat && lng && (
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                      "_blank",
                      "noopener"
                    )
                  }
                  className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition inline-flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  window.location.href = `tel:${requestorPhone.replace(/\s/g, "")}`;
                }}
                className="bg-white border border-brandNavy/20 hover:border-brandNavy/40 text-brandNavy rounded-lg min-h-10 px-4 text-sm font-semibold w-full md:w-auto transition inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call requestor
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Trip summary
          </h3>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-extrabold text-brandNavy">
                {distanceKm}
              </p>
              <p className="text-xs text-gray-500">km</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brandNavy">
                {etaMin}
              </p>
              <p className="text-xs text-gray-500">min</p>
            </div>
          </div>

          <hr className="border-t border-gray-200" />

          <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Visit
          </h3>
          <p className="font-semibold text-brandNavy">
            {request.requestorName}
          </p>
          <p className="text-sm text-gray-600">
            {formatDateTime(request.visitDate, request.timeSlot)}
          </p>
          <StatusBadge status={request.status} />

          <hr className="border-t border-gray-200" />

          <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Directions
          </h3>
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
            {waypoints.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
