export async function generateMetadata() {
  return {
    title: 'About Us | Pairivo',
    description: 'Learn more about Pairivo and our mission.',
  };
}

export default function AboutPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Pairivo is a speed-dating event SaaS platform for organizers who want a reliable end-to-end workflow.
        </p>
        <p className="mb-4">
          We focus on practical operations: event setup, participant registration, post-event choice collection,
          mutual match calculation, and follow-up email delivery. Our goal is to reduce manual work and make every event run smoothly.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
        <p>
          Help event hosts create safer and higher-quality offline dating experiences with clear process control and trustworthy automation.
        </p>
      </div>
    </div>
  );
}
