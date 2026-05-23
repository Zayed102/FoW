const styles = {
  unassigned: "bg-gray-200 text-gray-700",
  assigned: "bg-brandTeal/15 text-brandTeal",
  ongoing: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[status] || styles.unassigned
      }`}
    >
      {label}
    </span>
  );
}
