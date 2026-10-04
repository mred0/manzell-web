import { getEnquiries } from "@/lib/db/enquiries";
import { setEnquiryHandledAction } from "@/app/admin/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  const csvRows = enquiries.map((enquiry) => [
    enquiry.name,
    enquiry.email,
    enquiry.phone ?? "",
    enquiry.listingRef ?? "",
    enquiry.message,
    enquiry.handled ? "Handled" : "New",
    formatDate(enquiry.createdAt),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-deep">
            Enquiries
          </p>
          <h1 className="mt-1 font-display text-2xl italic text-brand-ink">
            {enquiries.filter((e) => !e.handled).length} new
          </h1>
        </div>
        {enquiries.length > 0 && (
          <ExportCsvButton
            headers={["Name", "Email", "Phone", "Listing", "Message", "Status", "Received"]}
            rows={csvRows}
            filename={`manzell-enquiries-${new Date().toISOString().slice(0, 10)}.csv`}
          />
        )}
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-6">
          <SetupNotice />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {enquiries.map((enquiry) => (
          <div
            key={enquiry.id}
            className={`border p-5 ${
              enquiry.handled ? "border-brand-border bg-white" : "border-brand-gold bg-brand-surface"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-ink">
                  {enquiry.name}{" "}
                  <span className="font-normal text-brand-ink/50">— {enquiry.email}</span>
                  {enquiry.phone && (
                    <span className="font-normal text-brand-ink/50"> · {enquiry.phone}</span>
                  )}
                </p>
                {enquiry.listingRef && (
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-brand-gold-deep">
                    Re: {enquiry.listingRef}
                  </p>
                )}
              </div>
              <p className="text-xs text-brand-ink/50">{formatDate(enquiry.createdAt)}</p>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-brand-ink/80">{enquiry.message}</p>

            <form
              action={setEnquiryHandledAction.bind(null, enquiry.id, !enquiry.handled)}
              className="mt-4"
            >
              <button
                type="submit"
                className="text-xs font-semibold uppercase tracking-wider text-brand-gold-deep hover:text-brand-plum"
              >
                {enquiry.handled ? "Mark as new" : "Mark as handled"}
              </button>
            </form>
          </div>
        ))}

        {enquiries.length === 0 && (
          <p className="border border-dashed border-brand-border p-10 text-center text-sm text-brand-ink/60">
            No enquiries yet.
          </p>
        )}
      </div>
    </div>
  );
}
