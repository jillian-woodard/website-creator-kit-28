import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <article className="font-sans text-base leading-relaxed text-foreground/90 space-y-5">
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-muted-foreground">Legal</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold uppercase tracking-tight text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: July 13, 2026</p>

          <p>
            Figure ("we," "us," or "our") is an AI-powered personal styling service. This Privacy Policy
            explains what information we collect, how we use it, and your rights and choices.
            If you have questions, email us at <a href="mailto:hello@figure.style" className="text-primary underline">hello@figure.style</a>.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Information we collect</h2>

          <h3 className="text-xl font-serif font-bold uppercase text-foreground pt-4">Information you give us directly</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> your email address and password when you create an account.</li>
            <li><strong>Style interview responses:</strong> body type, height, weight range, skin tone, age range, gender expression, budget, occasions you dress for, style keywords, and visual preferences you select during the interview.</li>
            <li><strong>Closet items:</strong> clothing items you add, including name, category, color, brand, and any photos you upload.</li>
          </ul>

          <h3 className="text-xl font-serif font-bold uppercase text-foreground pt-4">Information from Google (Gmail)</h3>
          <p>
            If you choose to connect Gmail, we request read-only access to your email
            (<code className="text-xs bg-muted px-1 py-0.5">gmail.readonly</code> scope) solely to identify
            clothing purchase confirmation emails. We extract basic order details (item name, merchant, price,
            date) for your review. We do not read, store, or process any other emails. You can revoke access
            at any time at{" "}
            <a href="https://myaccount.google.com/permissions" className="text-primary underline" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/permissions
            </a>.
          </p>

          <h3 className="text-xl font-serif font-bold uppercase text-foreground pt-4">Payment information</h3>
          <p>
            Payments are processed by Stripe. We do not store your card number or payment details —
            Stripe handles all payment data under their own privacy policy.
          </p>

          <h3 className="text-xl font-serif font-bold uppercase text-foreground pt-4">Usage data</h3>
          <p>
            We collect basic usage information (pages visited, features used, error logs) to operate
            and improve the service through standard server and application logging.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">How we use your information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To generate and maintain your personal style profile.</li>
            <li>To provide outfit recommendations, "For You" picks, and closet mixing features.</li>
            <li>To surface clothing items from Gmail purchase emails for your review.</li>
            <li>To process and manage your subscription.</li>
            <li>To send transactional emails (account confirmation, password reset). We do not send marketing emails without your explicit opt-in.</li>
            <li>To operate, debug, and improve the service.</li>
          </ul>
          <p>
            Your style interview data is sent to an AI model (Anthropic Claude) to generate your profile.
            It is used solely for that purpose and is not used to train AI models.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">How we share your information</h2>
          <p>We do not sell your personal information. We share it only with service providers necessary to operate Figure:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase</strong> — database and authentication hosting.</li>
            <li><strong>Anthropic</strong> — AI model inference for style profile and recommendations.</li>
            <li><strong>Stripe</strong> — subscription payment processing.</li>
            <li><strong>Vercel</strong> — website and edge function hosting.</li>
            <li><strong>Resend</strong> — transactional email delivery.</li>
            <li><strong>Google</strong> — OAuth authentication and Gmail access (when you connect Gmail).</li>
          </ul>
          <p>We may disclose information if required by law or to protect the safety of our users or the public.</p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Data retention</h2>
          <p>
            We retain your account and style data for as long as your account is active. Gmail OAuth tokens
            are stored to enable on-demand scanning and can be revoked at any time via Google. Detected
            purchase data is kept until you add or dismiss each item, or delete your account. When you delete
            your account, we delete your personal data within 30 days, except where retention is required by law.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, export, or delete your
            personal data. To exercise any of these rights, email{" "}
            <a href="mailto:hello@figure.style" className="text-primary underline">hello@figure.style</a>.
            We will respond within 30 days. If you are in the EEA or UK, you also have the right to lodge
            a complaint with your local data protection authority.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Cookies</h2>
          <p>
            We use only essential cookies and browser storage required for authentication and session
            management. We do not use advertising or tracking cookies.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Children's privacy</h2>
          <p>
            Figure is not directed to children under 13. We do not knowingly collect personal information
            from children under 13. If you believe a child has provided us with personal information,
            please contact us and we will delete it.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by posting the updated policy here with a new date. Continued use of Figure after a change
            constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">Contact</h2>
          <p>
            Questions? Email us at{" "}
            <a href="mailto:hello@figure.style" className="text-primary underline">hello@figure.style</a>.
          </p>
        </article>
      </div>

      <footer className="py-10 border-t border-border bg-background mt-8">
        <div className="container mx-auto px-6 text-center flex items-center justify-center gap-6 flex-wrap">
          <p className="text-xs text-muted-foreground font-sans uppercase tracking-[0.2em]">© 2026 Figure</p>
          <Link to="/terms" className="text-xs text-muted-foreground font-sans uppercase tracking-[0.2em] hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="text-xs text-muted-foreground font-sans uppercase tracking-[0.2em] hover:text-foreground transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
