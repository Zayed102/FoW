import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, message }) {
  return (
    <div className="w-full py-10 md:py-16 flex flex-col items-center text-center gap-2 text-gray-500">
      <Icon className="h-10 w-10" />
      {title && (
        <p className="font-semibold text-base text-brandNavy">{title}</p>
      )}
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
