import { APP_NAME } from "@/lib/constants";

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

function PolicyLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary hover:underline"
    >
      {children}
    </a>
  );
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

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-10">
      <p className="text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <Section id="introduction" title="1. Introduction">
        <p>
          {APP_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
          is an academic analytics platform that was developed under the
          supervision of African Leadership University. CollabTrack helps
          students and instructors measure individual contributions to group
          projects. We connect to collaboration tools such as GitHub and Google
          Workspace, and analyze meeting participation data to produce fair
          contribution reports.
        </p>
        <p>
          This Privacy Policy explains what personal information we collect, how
          we use it, who we share it with, and the choices available to you. It
          is written in plain language, following practices common to education
          and developer platforms such as{" "}
          <PolicyLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            GitHub
          </PolicyLink>
          and{" "}
          <PolicyLink href="https://policies.google.com/privacy">
            Google
          </PolicyLink>{" "}
          adapted to how {APP_NAME} actually works.
        </p>
        <p>
          By creating an account or using {APP_NAME}, you agree to this Privacy
          Policy. If you do not agree, please do not use the service.
        </p>
      </Section>

      <Section id="information-we-collect" title="2. Information We Collect">
        <Subheading>2.1 Account information</Subheading>
        <p>When you register or are added to {APP_NAME}, we collect:</p>
        <List
          items={[
            "Full name",
            "Email address",
            "Password (stored only as a secure hash; we never store plain text)",
            "Account role (student, instructor, or administrator)",
            "Account status and login history flags",
          ]}
        />
        <p>
          Instructors may add students to classes or groups by name and email.
          In those cases, an account may be created on the student&apos;s behalf
          with a temporary password that must be changed on first login.
        </p>

        <Subheading>2.2 Academic and group data</Subheading>
        <p>To support group work and contribution reporting, we store:</p>
        <List
          items={[
            "Classes, assignments, and project groups you create or join",
            "Group membership, roles, and invitations",
            "Linked GitHub repositories and Google Docs associated with a group",
            "Supervisor or reviewer email addresses entered by instructors",
            "Scoring preferences and generated contribution reports",
          ]}
        />

        <Subheading>2.3 Connected platform data</Subheading>
        <p>
          If you connect GitHub or Google from Settings, we collect OAuth tokens
          (encrypted at rest), your provider username, and provider email. We
          then retrieve collaboration activity from those services, including:
        </p>
        <List
          items={[
            <>
              <strong className="text-foreground">GitHub:</strong> commits,
              lines changed, pull requests, reviews, and comments in linked
              repositories
            </>,
            <>
              <strong className="text-foreground">Google Docs:</strong> edits,
              comments, revision activity, and document permissions for linked
              files
            </>,
            <>
              <strong className="text-foreground">
                Google contacts/directory (when authorized):
              </strong>{" "}
              used only to match platform identities to your {APP_NAME} account
              email
            </>,
          ]}
        />
        <p>
          We access only the data needed to measure participation in projects
          you or your instructor link to {APP_NAME}. We do not sell this data.
        </p>

        <Subheading>2.4 Meeting participation data</Subheading>
        <p>
          Instructors or group members may upload meeting files (for example,
          attendance CSV exports, transcript text files, or chat logs). These
          files may contain names, email addresses, speaking turns, attendance
          duration, facilitator status, and chat messages. We store the uploaded
          files and derive participation metrics such as attendance ratio,
          speaking ratio, and chat participation.
        </p>

        <Subheading>2.5 Derived analytics and automated scoring</Subheading>
        <p>
          {APP_NAME} calculates participation metrics and contribution scores
          from the data above. This includes normalized behavioral features,
          contributor tiers, machine-learning benchmark scores, and optional
          AI-generated rationales that explain a score. For AI scoring, we send
          aggregated, pseudonymized feature data (for example, &ldquo;Member
          A&rdquo;) to Google Gemini—not your raw meeting transcripts or full
          document contents.
        </p>

        <Subheading>2.6 Technical and session data</Subheading>
        <p>
          When you use {APP_NAME}, we process information needed to operate the
          service, including:
        </p>
        <List
          items={[
            "Authentication tokens issued after login (stored in your browser's local storage)",
            "Password-reset one-time codes (stored hashed in our database until used or expired)",
            "Standard server logs that may include IP address, request time, and error details",
          ]}
        />
        <p>
          We do not use third-party advertising or behavioral analytics cookies
          in the {APP_NAME} web application.
        </p>
      </Section>

      <Section
        id="how-we-use-information"
        title="3. How We Use Your Information"
      >
        <p>We use the information we collect to:</p>
        <List
          items={[
            "Create and manage your account and authenticate you",
            "Enable instructors to organize classes, assignments, and project groups",
            "Sync and aggregate collaboration activity from connected platforms",
            "Generate participation dashboards and contribution reports",
            "Send transactional emails such as password-reset codes and report-ready notifications",
            "Improve scoring & classification models using anonymized data from your contributions (admin-controlled)",
            "Maintain security, prevent abuse, and troubleshoot the service",
            "Comply with legal obligations and enforce our terms of use",
          ]}
        />
        <p>We do not use your personal information for targeted advertising.</p>
      </Section>

      <Section id="legal-bases" title="4. Legal Bases for Processing">
        <p>
          Depending on your location and context, we process personal data
          because:
        </p>
        <List
          items={[
            <>
              <strong className="text-foreground">Contract:</strong> processing
              is necessary to provide the service you or your institution signed
              up for
            </>,
            <>
              <strong className="text-foreground">Legitimate interests:</strong>{" "}
              to secure the platform, improve contribution measurement, and
              support academic integrity
            </>,
            <>
              <strong className="text-foreground">Consent:</strong> when you
              connect third-party integrations or upload meeting files
            </>,
            <>
              <strong className="text-foreground">Legal obligation:</strong>{" "}
              when required by applicable law
            </>,
          ]}
        />
        <p>
          Where your institution deploys {APP_NAME} for a course, your
          institution may also determine how student data is processed under its
          own policies.
        </p>
      </Section>

      <Section id="sharing" title="5. How We Share Information">
        <p>
          We do not sell your personal information. We may share data only as
          follows:
        </p>
        <List
          items={[
            <>
              <strong className="text-foreground">Within your project:</strong>{" "}
              instructors and group members authorized for a class or group can
              view relevant participation metrics and reports
            </>,
            <>
              <strong className="text-foreground">Service providers:</strong>{" "}
              hosting, database, object storage, email delivery, and AI
              inference providers that process data on our behalf under
              contractual safeguards
            </>,
            <>
              <strong className="text-foreground">
                Third-party platforms you connect:
              </strong>{" "}
              when you authorize GitHub or Google OAuth, those providers process
              data according to their own privacy policies
            </>,
            <>
              <strong className="text-foreground">Legal requirements:</strong>{" "}
              if required by law, regulation, legal process, or to protect
              rights, safety, and security
            </>,
          ]}
        />
      </Section>

      <Section id="third-party-services" title="6. Third-Party Services">
        <p>
          {APP_NAME} relies on the following categories of third-party services:
        </p>
        <List
          items={[
            <>
              <strong className="text-foreground">GitHub</strong> — repository
              activity via OAuth (
              <PolicyLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub Privacy Statement
              </PolicyLink>
              )
            </>,
            <>
              <strong className="text-foreground">Google</strong> — Docs, Drive
              Activity, and related APIs via OAuth (
              <PolicyLink href="https://policies.google.com/privacy">
                Google Privacy Policy
              </PolicyLink>
              )
            </>,
            <>
              <strong className="text-foreground">Google Gemini</strong> —
              AI-assisted participation scoring on aggregated features
            </>,
            <>
              <strong className="text-foreground">
                Cloud hosting and storage
              </strong>{" "}
              — application hosting, PostgreSQL database, and secure file
              storage for meeting uploads
            </>,
            <>
              <strong className="text-foreground">Email delivery</strong> —
              password reset and notification emails via SMTP or Resend
            </>,
          ]}
        />
        <p>
          When you disconnect an integration in Settings, we stop fetching new
          data from that provider. Previously synced metrics may remain in
          historical reports unless deleted with the related group or
          assignment.
        </p>
      </Section>

      <Section id="security" title="7. Data Security">
        <p>
          We apply technical and organizational measures designed to protect
          your information, including:
        </p>
        <List
          items={[
            "Password hashing with bcrypt",
            "Encrypted storage of third-party OAuth tokens",
            "HTTPS for data in transit",
            "Role-based access controls for student, instructor, and admin features",
            "Secure object storage for uploaded meeting files",
          ]}
        />
        <p>
          No method of transmission or storage is completely secure. If you
          believe your account has been compromised, change your password
          immediately and contact your instructor or institution administrator.
        </p>
      </Section>

      <Section id="retention" title="8. Data Retention">
        <p>
          We retain personal information for as long as your account is active
          or as needed to provide the service, generate academic reports, and
          comply with legal obligations. Specific data may be deleted earlier
          when:
        </p>
        <List
          items={[
            "You or an authorized user deletes a group, assignment, class, or meeting session",
            "An administrator deactivates an account (login is blocked; records may be retained)",
            "Training or sandbox datasets are cleared by an administrator",
          ]}
        />
        <p>
          We may retain limited backup or log data for a reasonable period for
          security, audit, and disaster-recovery purposes.
        </p>
      </Section>

      <Section id="your-rights" title="9. Your Rights and Choices">
        <p>Depending on applicable law, you may have the right to:</p>
        <List
          items={[
            "Access and update your profile information in Settings",
            "Change your password at any time",
            "Disconnect GitHub or Google integrations in Settings",
            "Request correction of inaccurate personal data",
            "Request deletion of your account or specific data",
            "Object to or restrict certain processing",
            "Receive a copy of your data in a portable format, where applicable",
          ]}
        />
        <p>
          To exercise these rights, contact your course instructor or
          institution administrator, or email us at{" "}
          <a
            href="y.gahamanyi@alustudent.com"
            className="font-medium text-primary hover:underline"
          >
            y.gahamanyi@alustudent.com
          </a>
          . We will respond within a reasonable timeframe and may need to verify
          your identity.
        </p>
        <p>
          If you are a student whose account was created by an instructor, your
          institution may need to approve certain requests.
        </p>
      </Section>

      <Section id="international" title="10. International Data Transfers">
        <p>
          {APP_NAME} may process and store information on servers located
          outside your country of residence, including through cloud hosting
          providers. Where required, we rely on appropriate safeguards for
          cross-border transfers.
        </p>
      </Section>

      <Section id="children" title="11. Academic Use">
        <p>
          {APP_NAME} is intended for use in academic and educational settings by
          students, instructors, and administrators who are at least 16 years
          old or the minimum age required by their institution. We do not
          knowingly collect personal information from children under 13. If you
          believe we have collected such information, contact us so we can
          delete it.
        </p>
      </Section>

      <Section id="changes" title="12. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. When we make
          material changes, we will update the &ldquo;Last updated&rdquo; date
          at the top of this page and, where appropriate, notify users through
          the application or by email. Continued use of {APP_NAME} after changes
          take effect constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section id="contact" title="13. Contact Us">
        <p>
          If you have questions about this Privacy Policy or how {APP_NAME}{" "}
          handles your data, contact us at:
        </p>
        <List
          items={[
            <>
              Email:{" "}
              <a
                href="y.gahamanyi@alustudent.com"
                className="font-medium text-primary hover:underline"
              >
                y.gahamanyi@alustudent.com
              </a>
            </>,
          ]}
        />
        <p>
          For course-specific questions about grades, reports, or data shared
          with your instructor, please contact your instructor or institution
          directly.
        </p>
      </Section>
    </article>
  );
}
