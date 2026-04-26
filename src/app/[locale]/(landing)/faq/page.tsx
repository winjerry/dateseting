import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';

export async function generateMetadata() {
  return {
    title: 'FAQ | Pairivo',
    description: 'Frequently asked questions about Pairivo.',
  };
}

export default function FAQPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
      <p className="text-center text-muted-foreground mb-12">Find answers to common questions about our platform.</p>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Pairivo?</AccordionTrigger>
          <AccordionContent>
            Pairivo is a speed-dating event platform that helps organizers run complete event workflows:
            registration, participant management, choices, matching, and post-event notifications.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I join an event?</AccordionTrigger>
          <AccordionContent>
            You can join through the event link or QR code shared by the organizer. After registration,
            you can submit your choices when the event flow opens.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How does the matching work?</AccordionTrigger>
          <AccordionContent>
            Matching is mutual. If both participants choose each other, it becomes a match and
            contact details can be delivered by email after the event is completed.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Is my data secure?</AccordionTrigger>
          <AccordionContent>
            Yes. We take privacy seriously. Your contact information is only shared with mutual matches. We do not sell your personal data to third parties.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>Can I host my own event?</AccordionTrigger>
          <AccordionContent>
            Yes. Sign in as organizer, create an event, then manage registrations, matching, and follow-up emails from your dashboard.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
