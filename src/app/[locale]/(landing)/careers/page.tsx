export async function generateMetadata() {
  return {
    title: 'Careers | Pairivo',
    description: 'Join the Pairivo team.',
  };
}

export default function CareersPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Careers</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Help us build better infrastructure for offline dating events.
        </p>
        
        <h2 className="text-2xl font-semibold mb-6">Current Hiring Status</h2>
        
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-xl font-medium mb-2">No Public Openings at the Moment</h3>
          <p className="text-muted-foreground mb-4">Updated April 2026</p>
          <p>
            We&apos;re currently not hiring for public roles. If your background fits product engineering,
            growth, or event operations, you can still share your profile with us.
          </p>
        </div>
        
        <p className="mt-8">
          You can send your resume to{' '}
          <a href="mailto:support@pairivo.com" className="text-primary hover:underline">
            support@pairivo.com
          </a>
          {' '}with the subject line &quot;Career - [Your Role]&quot;.
        </p>
      </div>
    </div>
  );
}
