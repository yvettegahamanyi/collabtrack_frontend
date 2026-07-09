import { APP_NAME, ROUTES } from "@/lib/constants";

const LAST_UPDATED = "July 9, 2026";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-medium text-foreground">{children}</h3>;
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function TermsOfServiceContent() {
  return (
    <article className="space-y-10">
      <p className="text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <Section id="acceptance" title="1. Acceptance of Terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
          use of {APP_NAME}, including our website, APIs, and related services
          (collectively, the &ldquo;Service&rdquo;). By creating an account,
          connecting an integration, or otherwise using the Service, you agree
          to these Terms and to our{" "}
          <a
            href={ROUTES.privacy}
            className="font-medium text-primary hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>
        <p>
          If you do not agree, you may not use the Service. If you are using the
          Service on behalf of an institution, you represent that you have
          authority to bind that institution to these Terms.
        </p>
      </Section>

      <Section id="eligibility" title="2. Eligibility">
        <p>
          {APP_NAME} is designed for academic and educational use by students,
          instructors, and administrators. You must be at least 16 years old, or
          the minimum age required by your institution, to create an account.
        </p>
        <p>
          You are responsible for ensuring that your use of the Service complies
          with your university or school policies, including policies on
          academic integrity, data use, and third-party platform access.
        </p>
      </Section>

      <Section id="accounts" title="3. Accounts and Security">
        <Subheading>3.1 Registration</Subheading>
        <p>
          You must provide accurate and complete information when registering.
          You are responsible for maintaining the confidentiality of your login
          credentials and for all activity under your account.
        </p>

        <Subheading>3.2 Instructor-provisioned accounts</Subheading>
        <p>
          An instructor may create an account for you using your name and email.
          If that happens, you must sign in, change any temporary password when
          prompted, and review these Terms and our Privacy Policy before
          continuing to use the Service.
        </p>

        <Subheading>3.3 Account suspension</Subheading>
        <p>
          We or your institution&apos;s administrator may suspend or deactivate
          accounts that violate these Terms, pose a security risk, or are no
          longer authorized for use.
        </p>
      </Section>

      <Section id="service-description" title="4. The Service">
        <p>
          {APP_NAME} helps instructors and students measure individual
          contributions to group projects by aggregating activity from linked
          collaboration tools and uploaded meeting participation data. The
          Service may include dashboards, contribution reports, automated
          scoring, and AI-generated explanations of participation metrics.
        </p>
        <p>
          Reports and scores are provided for academic review and discussion.
          They are analytical tools, not official grades, disciplinary findings,
          or legal determinations. Instructors remain responsible for final
          academic judgments.
        </p>
      </Section>

      <Section id="acceptable-use" title="5. Acceptable Use">
        <p>You agree not to:</p>
        <List
          items={[
            "Use the Service for any unlawful, fraudulent, or harmful purpose",
            "Access or attempt to access data, groups, or reports you are not authorized to view",
            "Upload false, misleading, or manipulated participation data",
            "Connect third-party accounts you do not have permission to use",
            "Reverse engineer, scrape, or overload the Service in ways that impair others",
            "Share login credentials or attempt to bypass authentication or role restrictions",
            "Use the Service to harass, discriminate against, or unfairly target others",
          ]}
        />
        <p>
          You must only link repositories, documents, and meeting files that
          relate to authorized academic work for the relevant class or group.
        </p>
      </Section>

      <Section id="integrations" title="6. Third-Party Integrations">
        <p>
          The Service may connect to third-party platforms such as GitHub and
          Google. Your use of those integrations is also subject to the third
          party&apos;s own terms and privacy policies.
        </p>
        <p>
          By connecting an integration, you authorize {APP_NAME} to access the
          data needed to measure participation in projects you or your
          instructor link to the Service. You may disconnect integrations at any
          time in Settings, subject to retention rules described in our Privacy
          Policy.
        </p>
      </Section>

      <Section id="content" title="7. User Content and Data">
        <p>
          You and other authorized users may upload or link content such as
          meeting transcripts, attendance files, chat logs, repository URLs, and
          document links. You retain ownership of your content, but you grant{" "}
          {APP_NAME} a limited license to store, process, and display that
          content solely to operate the Service and generate participation
          reports for authorized users.
        </p>
        <p>
          You represent that you have the rights and permissions needed to
          upload or link any content you provide, including permission from
          meeting participants where applicable.
        </p>
      </Section>

      <Section id="intellectual-property" title="8. Intellectual Property">
        <p>
          {APP_NAME}, including its software, branding, scoring models, and
          documentation, is owned by us or our licensors and is protected by
          applicable intellectual property laws. These Terms do not grant you
          any ownership rights in the Service itself.
        </p>
        <p>
          Feedback you submit may be used by us to improve the Service without
          obligation to you.
        </p>
      </Section>

      <Section id="availability" title="9. Service Availability">
        <p>
          We strive to keep the Service available and accurate, but we do not
          guarantee uninterrupted access, error-free operation, or complete
          synchronization with third-party platforms. Maintenance, outages, API
          changes, or data delays may occur.
        </p>
        <p>
          We may modify, suspend, or discontinue features with reasonable notice
          where practicable.
        </p>
      </Section>

      <Section id="termination" title="10. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or
          terminate access if you violate these Terms or if continued access is
          no longer appropriate for security, legal, or operational reasons.
        </p>
        <p>
          Termination does not automatically delete all stored data. Data
          handling after termination is described in our Privacy Policy.
        </p>
      </Section>

      <Section id="disclaimers" title="11. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM
          ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that participation scores, AI-generated rationales,
          or reports are complete, unbiased, or suitable as the sole basis for
          academic or employment decisions.
        </p>
      </Section>

      <Section id="liability" title="12. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {APP_NAME.toUpperCase()} AND
          ITS OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF DATA,
          PROFITS, GOODWILL, OR ACADEMIC OUTCOMES ARISING FROM YOUR USE OF THE
          SERVICE.
        </p>
        <p>
          Our total liability for any claim relating to the Service will not
          exceed the greater of the amount you paid us in the twelve months
          before the claim or one hundred U.S. dollars (USD $100), except where
          such limitation is prohibited by law.
        </p>
      </Section>

      <Section id="indemnity" title="13. Indemnification">
        <p>
          You agree to indemnify and hold harmless {APP_NAME} and its operators
          from claims, damages, and expenses arising out of your misuse of the
          Service, your violation of these Terms, or your violation of any
          third-party rights or institutional policies.
        </p>
      </Section>

      <Section id="changes" title="14. Changes to These Terms">
        <p>
          We may update these Terms from time to time. When we make material
          changes, we will update the &ldquo;Last updated&rdquo; date above and,
          where appropriate, provide notice through the Service. Continued use
          after changes take effect constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section id="governing-law" title="15. Governing Law">
        <p>
          These Terms are governed by the laws applicable where {APP_NAME} is
          operated, without regard to conflict-of-law principles. If your
          institution provides the Service under a separate agreement, that
          agreement may govern instead where it expressly overrides these Terms.
        </p>
      </Section>

      <Section id="contact" title="16. Contact">
        <p>
          Questions about these Terms can be sent to{" "}
          <a
            href="y.gahamanyi@alustudent.com"
            className="font-medium text-primary hover:underline"
          >
            y.gahamanyi@alustudent.com
          </a>
          .
        </p>
      </Section>
    </article>
  );
}
