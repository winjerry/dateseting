import { envConfigs } from '@/config';

export async function generateMetadata() {
  return {
    title: 'Contact Us | Pairivo',
    description: 'Get in touch with the Pairivo team.',
  };
}

export default function ContactPage() {
  const supportEmail = envConfigs.support_email;
  return (
    <div className="container mx-auto py-24 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg text-muted-foreground mb-8">
            Have questions, feedback, or need support? Reach out via email and we&apos;ll reply as soon as possible.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">Email Support</h3>
              <p className="text-muted-foreground"><a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a></p>
              <p className="text-sm text-muted-foreground mt-1">We aim to respond to all inquiries within 24 hours.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Business Inquiries</h3>
              <p className="text-muted-foreground"><a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a></p>
            </div>
          </div>
        </div>
        
        {/* Placeholder for a contact form if needed in the future */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
          <p className="text-muted-foreground mb-4">
            Currently, the best way to reach us is via email. A contact form will be available here soon.
          </p>
          <a 
            href={`mailto:${supportEmail}`} 
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
