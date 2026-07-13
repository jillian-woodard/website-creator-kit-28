import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: July 13, 2026</p>

          <p>
            These Terms of Service ("Terms") govern your use of Figure and any related services
            (collectively, the "Service") operated by Figure ("we," "us," or "our"). By accessing or
            using the Service, you agree to these Terms. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">1. Eligibility</h2>
          <p>
            You must be at least 13 years old to use Figure. By using the Service, you represent that
            you meet this requirement. If you are under 18, you represent that your parent or legal
            guardian has reviewed and agreed to these Terms on your behalf.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">2. Your account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for
            all activity that occurs under your account. Notify us immediately at{" "}
            <a href="mailto:hello@figure.style" className="text-primary underline">hello@figure.style</a>{" "}
            if you believe your account has been compromised. We reserve the right to terminate accounts
            that violate these Terms.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">3. Subscription and billing</h2>
          <p>
            Access to the full Figure product requires a paid subscription at $9/month (or the current
            price displayed at time of purchase). Subscriptions renew automatically each month until
            cancelled. You may cancel at any time; cancellation takes effect at the end of your current
            billing period and you will not be charged again. No refunds are issued for partial billing
            periods. Payments are processed by Stripe and subject to Stripe's terms.
          </p>
          <p>
            The style interview is available free of charge with no account required. Full closet,
            planner, and recommendation features require an active subscription.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">4. Gmail access</h2>
          <p>
            If you connect your Gmail account, you grant Figure read-only access to your email for the
            sole purpose of identifying clothing purchase confirmation emails. We will only surface
            detected items for your review — we will never read, share, or store other email content,
            and we will never send emails on your behalf. You can revoke Gmail access at any time from
            your Google Account settings at{" "}
            <a href="https://myaccount.google.com/permissions" className="text-primary underline" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/permissions
            </a>.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">5. AI-generated content</h2>
          <p>
            Figure uses AI to generate style profiles, outfit suggestions, and product recommendations.
            This output is for personal styling inspiration only — it does not constitute professional
            fashion, financial, or any other professional advice. Style recommendations are based on
            information you provide and may not always reflect your personal taste or circumstances.
            You are solely responsible for purchasing decisions you make based on content provided by
            the Service.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">6. Inspiration content and third-party images</h2>
          <p>
            The Service may display images of public figures and street-style photography for
            inspirational purposes. Figure does not claim ownership of or affiliation with any person
            depicted. Product links may include affiliate links; Figure may earn a commission on
            purchases made through such links at no additional cost to you.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">7. Your content</h2>
          <p>
            You retain ownership of any content you upload to Figure (e.g., closet item photos). By
            uploading content, you grant us a limited, non-exclusive license to store and display that
            content solely to provide the Service to you. We do not use your content to train AI models
            or share it with third parties except as necessary to operate the Service.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">8. Prohibited conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
            <li>Use the Service to scrape, harvest, or collect data about other users.</li>
            <li>Transmit any malicious code, viruses, or disruptive data.</li>
          </ul>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">9. Disclaimer of warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS
            OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that the Service will be
            uninterrupted, error-free, or that AI-generated style recommendations will meet your
            expectations.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">10. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FIGURE AND ITS OWNERS, EMPLOYEES, AND
            AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS OR DATA, ARISING OUT OF OR IN
            CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE
            AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Figure and its owners, employees, and agents from
            any claims, damages, or expenses (including reasonable legal fees) arising from your use of
            the Service, your violation of these Terms, or your violation of any third-party rights.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">12. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time for violations of these
            Terms, with or without notice. You may stop using the Service and cancel your subscription
            at any time. Upon termination, your right to use the Service ceases immediately.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">13. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by
            posting the updated Terms here with a new date and, where appropriate, by email. Continued
            use of the Service after the effective date constitutes acceptance of the updated Terms.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">14. Governing law</h2>
          <p>
            These Terms are governed by the laws of the Commonwealth of Massachusetts, United States,
            without regard to its conflict of law principles. Any disputes arising under these Terms
            shall be resolved in the state or federal courts located in Massachusetts.
          </p>

          <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase text-foreground pt-8">15. Contact</h2>
          <p>
            Questions about these Terms? Email us at{" "}
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

export default Terms;
