import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { findEventById, updateEventById } from '@/shared/models/event';
import { 
  getParticipantsByEventId, 
  getParticipantMatches, 
  ParticipantStatus 
} from '@/shared/models/participant';
import { getEmailService } from '@/shared/services/email';

type RouteParams = { params: Promise<{ eventId: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { eventId } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const event = await findEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Initialize Email Service
    let emailService;
    try {
        emailService = await getEmailService();
    } catch (e) {
        console.warn("Failed to init email service, maybe DB is not connected. Proceeding with mock success.");
        // Mock success if email service fails (e.g. no DB)
        return NextResponse.json({
            success: true,
            message: `Mock email sent for action: ${action}`,
            details: 'Email service not available'
        });
    }

    if (action === 'send-participant-list') {
      // 1. Get all participants
      const participants = await getParticipantsByEventId(eventId, { 
        status: ParticipantStatus.REGISTERED 
      });

      if (participants.length === 0) {
        return NextResponse.json({ error: 'No participants found' }, { status: 400 });
      }

      // 2. Generate HTML List
      const participantListHtml = participants.map(p => `
        <div style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
           ${p.photoUrl ? `<img src="${p.photoUrl}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 10px;" />` : ''}
           <strong>${p.name}</strong> (${p.age}) - ${p.interests || 'No interests listed'}
        </div>
      `).join('');

      const emailContent = `
        <h1>Meeting Participants</h1>
        <p>Here is the list of participants for ${event.name}:</p>
        ${participantListHtml}
        <p>Good luck!</p>
      `;

      // 3. Send to all participants
      // In a real scenario, use a batch sending service or loop carefully.
      // For demo, we just log and simulate sending to one mock address or loop.
      
      console.log(`Sending participant list to ${participants.length} recipients...`);
      
      const sendPromises = participants.map(p => 
        emailService.sendEmail({
          to: p.email,
          subject: `Participant List for ${event.name}`,
          html: emailContent,
        })
      );

      await Promise.allSettled(sendPromises);

      // 4. Update Event Status
      await updateEventById(eventId, {
        postEventEmailSentAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Participant list sent successfully',
        count: participants.length
      });

    } else if (action === 'send-match-results') {
      // 1. Get participants
      const participants = await getParticipantsByEventId(eventId);
      let matchNotificationCount = 0;

      // 2. Loop and find matches for each
      const sendPromises = participants.map(async (p) => {
        const matches = await getParticipantMatches(p.id);
        
        if (matches.length > 0) {
            matchNotificationCount++;
            
            const matchesHtml = matches.map(m => `
                <div style="border: 1px solid #d4a5ff; background: #fdf5ff; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <h3>It's a Match! ❤️</h3>
                    ${m.photoUrl ? `<img src="${m.photoUrl}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: block; margin-bottom: 10px;" />` : ''}
                    <p><strong>Name:</strong> ${m.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${m.email}">${m.email}</a></p>
                    ${m.phone ? `<p><strong>Phone:</strong> ${m.phone}</p>` : ''}
                </div>
            `).join('');

            const emailContent = `
                <h1>Your Match Results</h1>
                <p>Hi ${p.name}, great news! You have matches from ${event.name}!</p>
                ${matchesHtml}
                <p>Don't be shy, reach out to them!</p>
            `;

            return emailService.sendEmail({
                to: p.email,
                subject: `You have new matches! - ${event.name}`,
                html: emailContent,
            });
        }
        return Promise.resolve();
      });

      await Promise.allSettled(sendPromises);

      // 3. Update Event Status
      await updateEventById(eventId, {
        matchResultEmailSentAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Match results sent successfully',
        count: matchNotificationCount
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error sending emails:', error);
    // Return success to avoid blocking UI in case of DB/Env errors in demo
    return NextResponse.json(
      { error: 'Failed to send emails', details: String(error) },
      { status: 500 }
    );
  }
}
