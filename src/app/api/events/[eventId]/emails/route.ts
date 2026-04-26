import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { findEventById, updateEventById } from '@/shared/models/event';
import {
  findParticipantById,
  getMatchResults,
  getParticipantsByEventId,
  markMatchesAsNotified,
} from '@/shared/models/participant';
import { getAllConfigs } from '@/shared/models/config';
import { Resend } from 'resend';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { eventId } = params;
    const { action } = await request.json(); // 'send-participant-list' | 'send-match-results'

    const event = await findEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get configs from database
    const configs = await getAllConfigs();
    const apiKey = configs['resend_api_key'];
    const senderEmail = configs['resend_sender_email'] || 'Speed Dating <onboarding@resend.dev>';

    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured (Missing Resend API Key in Settings)' }, { status: 500 });
    }

    // Initialize Resend with key from DB
    const resend = new Resend(apiKey);

    let stats = { total: 0, success: 0, failed: 0 };

    if (action === 'send-participant-list') {
      const participants = await getParticipantsByEventId(eventId);
      stats.total = participants.length;

      const results = await Promise.allSettled(
        participants.map(p => 
          resend.emails.send({
            from: senderEmail,
            to: p.email,
            subject: `Participant List: ${event.name}`,
            html: `
              <h2>Participant List for ${event.name}</h2>
              <p>Here are the people you will meet today:</p>
              <div style="display:grid;gap:12px;">
                ${participants
                  .map((item) => {
                    const firstName = item.name.split(' ')[0];
                    const photo = item.photoUrl
                      ? `<img src="${item.photoUrl}" alt="${firstName}" width="72" height="72" style="width:72px;height:72px;border-radius:9999px;object-fit:cover;" />`
                      : `<div style="width:72px;height:72px;border-radius:9999px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-weight:700;">${firstName.charAt(0)}</div>`;

                    return `
                      <div style="display:flex;align-items:center;gap:12px;">
                        ${photo}
                        <div>
                          <div style="font-weight:600;">${firstName}</div>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `,
          })
        )
      );

      stats.success = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
      stats.failed = stats.total - stats.success;

      if (stats.failed === 0 && stats.total > 0) {
        await updateEventById(eventId, {
          postEventEmailSentAt: new Date(),
        });
      }

    } else if (action === 'send-match-results') {
      if (!event.isMatchingCompleted) {
        return NextResponse.json(
          { error: 'Calculate matches before sending results' },
          { status: 400 }
        );
      }

      const matches = await getMatchResults(eventId);
      
      // Group matches by participant to send one email per person
      const userMatches = new Map<string, string[]>(); // participantId -> [targetIds]
      
      matches.forEach(m => {
        if (!userMatches.has(m.participant1Id)) userMatches.set(m.participant1Id, []);
        if (!userMatches.has(m.participant2Id)) userMatches.set(m.participant2Id, []);
        
        userMatches.get(m.participant1Id)?.push(m.participant2Id);
        userMatches.get(m.participant2Id)?.push(m.participant1Id);
      });

      stats.total = userMatches.size;
      const promises: Promise<any>[] = [];

      for (const [userId, matchIds] of userMatches) {
        promises.push((async () => {
          const user = await findParticipantById(userId);
          if (!user || !user.email) return { error: 'User not found' };

          const matchedUsers = await Promise.all(
            matchIds.map(id => findParticipantById(id))
          );
          
          const validMatches = matchedUsers.filter(u => u !== undefined);

          const matchesHtml = `
            <h2>Congratulations! You have matches! 💕</h2>
            <p>Here are your mutual matches from ${event.name}:</p>
            <ul>
              ${validMatches.map(m => `
                <li>
                  <strong>${m!.name}</strong><br/>
                  Email: ${m!.email}<br/>
                  ${m!.phone ? `Phone: ${m!.phone}` : ''}
                </li>
              `).join('')}
            </ul>
            <p>Reach out and say hello!</p>
          `;

          return resend.emails.send({
            from: senderEmail,
            to: user.email,
            subject: `Your Matches from ${event.name}!`,
            html: matchesHtml,
          });
        })());
      }

      const results = await Promise.allSettled(promises);
      stats.success = results.filter(r => r.status === 'fulfilled' && !(r.value as any)?.error).length;
      stats.failed = stats.total - stats.success;

      if (stats.failed === 0 && stats.total > 0) {
        await updateEventById(eventId, {
          matchResultEmailSentAt: new Date(),
        });
        await markMatchesAsNotified(eventId);
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${stats.total} emails`,
      stats
    });
  } catch (error: any) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
