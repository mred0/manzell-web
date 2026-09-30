export default function SetupNotice() {
  return (
    <div className="border border-dashed border-brand-gold bg-brand-surface p-6 text-sm text-brand-ink/80">
      <p className="font-semibold text-brand-ink">Supabase isn&rsquo;t connected yet</p>
      <p className="mt-1">
        This page is showing static seed data / nothing to manage until a
        Supabase project is set up. See{" "}
        <code className="text-brand-gold-deep">SUPABASE_SETUP.md</code> at
        the repo root, then add the three env vars it asks for to{" "}
        <code className="text-brand-gold-deep">.env.local</code>.
      </p>
    </div>
  );
}
