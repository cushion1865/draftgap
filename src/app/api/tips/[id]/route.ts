import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const { content } = await request.json();
	if (!content || content.length < 10 || content.length > 500) {
		return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
	}

	const { data, error } = await supabase
		.from('matchup_tips')
		.update({ content })
		.eq('id', id)
		.eq('user_id', user.id)
		.select('content')
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ content: data.content });
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const { error } = await supabase
		.from('matchup_tips')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ success: true });
}
