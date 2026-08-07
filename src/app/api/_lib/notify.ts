import 'server-only';

/**
 * THE NOTIFICATION SEAM.
 *
 * There are no email notifications in this build: the team reviews
 * submissions directly in the Supabase dashboard. This file exists so that
 * adding email later means changing THIS FILE ONLY. No caller changes, no
 * schema changes, no restructuring.
 *
 * To add email later:
 *   1. Install an email library and add its key to config.ts.
 *   2. Replace the body of the switch below with the send call.
 *   3. Nothing else. Both submit endpoints already await notify() inside a
 *      try/catch that swallows failures, so a downed email provider can never
 *      turn a saved submission into a failed request.
 *
 * WHAT MAY BE LOGGED: opaque identifiers and the company name.
 * WHAT MAY NEVER BE LOGGED: email addresses, phone numbers, message bodies,
 * descriptions, filenames, or storage paths. A deck path is a capability hint
 * and personal data is personal data, even in a server log.
 */

export type NotifyEvent =
  | { kind: 'new_pitch'; submissionId: string; companyName: string }
  | { kind: 'new_contact'; messageId: string; hasSubject: boolean };

export async function notify(event: NotifyEvent): Promise<void> {
  switch (event.kind) {
    case 'new_pitch':
      console.info(
        `[coastline] new pitch submission ${event.submissionId} from ${event.companyName}`,
      );
      return;

    case 'new_contact':
      // No name or email here: a contact message carries nothing that is safe
      // to log beyond the fact that one arrived.
      console.info(
        `[coastline] new contact message ${event.messageId}${event.hasSubject ? ' (with subject)' : ''}`,
      );
      return;
  }
}

/**
 * Fire and forget. Notification is a side effect of a submission, never a
 * precondition for it: the row is already committed by the time this runs, so
 * a failure here must not surface to the founder as a failed submission.
 */
export async function notifyQuietly(event: NotifyEvent): Promise<void> {
  try {
    await notify(event);
  } catch (error) {
    console.error('[coastline] notify failed', error instanceof Error ? error.name : 'unknown');
  }
}
