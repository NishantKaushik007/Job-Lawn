import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Read the raw body as text (needed for signature verification downstream)
    const rawBody = await request.text();
    // Parse the payload (for checking event type)
    const payload = JSON.parse(rawBody);
    console.log('[Webhook] Received payload:', payload);

    // Process only payment.captured events
    if (payload.event === 'payment.captured') {
      console.log('[Webhook] Payment captured event detected.');

      // Forward the raw body and signature header to the verification endpoint
      const verificationUrl = 'https://eb09-110-235-230-31.ngrok-free.app/api/verification';
      console.log('[Webhook] Forwarding verification data to:', verificationUrl);

      // Get the x-razorpay-signature header from the original request
      const razorpaySignature = request.headers.get('x-razorpay-signature') || '';

      // Forward the raw body and signature header as-is
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': razorpaySignature,
        },
        body: rawBody,
      });

      if (!verificationResponse.ok) {
        console.error(
          '[Webhook] Verification endpoint returned error status:',
          verificationResponse.status
        );
        return NextResponse.json(
          { error: 'Failed to verify payment' },
          { status: verificationResponse.status }
        );
      }

      const verificationData = await verificationResponse.json();
      console.log('[Webhook] Verification endpoint returned:', verificationData);

      return NextResponse.json({
        message: 'Payment captured and verified successfully.',
        verificationData,
      });
    } else {
      console.warn('[Webhook] Received unhandled event:', payload.event);
      return NextResponse.json({ message: 'Event not handled.' });
    }
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
