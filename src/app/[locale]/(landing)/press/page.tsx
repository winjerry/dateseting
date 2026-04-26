export async function generateMetadata() {
  return {
    title: 'Press | Pairivo',
    description: 'Press releases and media resources for Pairivo.',
  };
}

export default function PressPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Press & Media</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Latest announcements and media resources from Pairivo.
        </p>

        <h2 className="text-2xl font-semibold mb-6">Recent Announcements</h2>
        <ul className="space-y-4">
          <li className="border-b pb-4">
            <span className="text-sm text-muted-foreground">April 25, 2026</span>
            <h3 className="text-xl font-medium mt-1">Pairivo Public Site and Organizer Workflow Update</h3>
            <p className="mt-2">Launched a cleaner homepage, organizer dashboard improvements, and streamlined event operations flow.</p>
          </li>
          <li className="border-b pb-4">
            <span className="text-sm text-muted-foreground">March 30, 2026</span>
            <h3 className="text-xl font-medium mt-1">Pairivo Integrates End-to-End Match Notification Pipeline</h3>
            <p className="mt-2">Organizers can now complete matching and participant email notifications from one dashboard.</p>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Media Contact</h2>
        <p>
          For press inquiries, please reach out to us at{' '}
          <a href="mailto:support@pairivo.com" className="text-primary hover:underline">
            support@pairivo.com
          </a>.
        </p>
      </div>
    </div>
  );
}
