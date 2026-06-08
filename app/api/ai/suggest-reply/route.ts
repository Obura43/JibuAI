import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MOCK_SUGGESTIONS = [
  'Thank you for reaching out! I would be happy to help you with that. Could you provide more details so I can assist you better?',
  'Hello! Thanks for your message. Based on what you have shared, here is what I can help with...',
  'Hi there! I understand your question. Let me get you the right information right away.',
  'Thank you for contacting us! We are here to help. Please allow me to look into this for you.',
  'Great question! I will be happy to assist you with this. Here is what you need to know...',
];

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const serverClient = createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conversation_id, organization_id } = body;
    if (!conversation_id || !organization_id) {
      return NextResponse.json({ error: 'conversation_id and organization_id are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: member } = await admin.from('organization_members').select('role').eq('organization_id', organization_id).eq('user_id', user.id).maybeSingle();
    if (!member || !['org_owner','org_admin','agent'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get recent messages for context
    const { data: messages } = await admin.from('messages').select('body, sender_type').eq('conversation_id', conversation_id).order('created_at', { ascending: false }).limit(10);

    let suggestion: string;

    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiMessages = (messages ?? []).reverse().map(m => ({
          role: m.sender_type === 'visitor' ? 'user' : 'assistant',
          content: m.body,
        }));
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful customer support agent for a Kenyan business. Generate a friendly, professional, and helpful reply. Keep it concise (2-4 sentences). Do not use emojis excessively.' },
              ...openaiMessages,
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });
        const data = await response.json();
        suggestion = data.choices?.[0]?.message?.content ?? MOCK_SUGGESTIONS[0];
      } catch {
        suggestion = MOCK_SUGGESTIONS[Math.floor(Math.random() * MOCK_SUGGESTIONS.length)];
      }
    } else {
      // Mock fallback
      const lastVisitorMsg = (messages ?? []).find(m => m.sender_type === 'visitor')?.body ?? '';
      if (lastVisitorMsg.toLowerCase().includes('loan')) {
        suggestion = 'Thank you for your interest in our loan products. Our personal loan rates start from 14% p.a. and you can apply online in just 5 minutes. Would you like me to send you the application link?';
      } else if (lastVisitorMsg.toLowerCase().includes('hour') || lastVisitorMsg.toLowerCase().includes('open')) {
        suggestion = 'Our business hours are Monday to Friday 8am-6pm and Saturday 9am-2pm. We are closed on Sundays and public holidays. Is there anything else I can help you with?';
      } else if (lastVisitorMsg.toLowerCase().includes('price') || lastVisitorMsg.toLowerCase().includes('cost')) {
        suggestion = 'Thank you for asking about our pricing. Our plans start from KES 2,500 per month. Could you tell me more about your specific needs so I can recommend the best option for you?';
      } else {
        suggestion = MOCK_SUGGESTIONS[Math.floor(Math.random() * MOCK_SUGGESTIONS.length)];
      }
    }

    const { data: aiSuggestion } = await admin.from('ai_suggestions').insert({
      organization_id,
      conversation_id,
      suggested_reply: suggestion,
      accepted: false,
    }).select('id').single() as { data: { id: string } | null };

    return NextResponse.json({ success: true, suggestion, suggestion_id: (aiSuggestion as { id?: string } | null)?.id });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
