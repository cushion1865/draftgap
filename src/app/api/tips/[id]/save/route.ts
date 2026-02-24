import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	// 既に保存済みか確認
	const { data: existing } = await supabase
		.from('tip_saves')
		.select('tip_id')
		.eq('tip_id', id)
		.eq('user_id', user.id)
		.maybeSingle();

	if (existing) {
		// 保存解除
		const { error } = await supabase
			.from('tip_saves')
			.delete()
			.eq('tip_id', id)
			.eq('user_id', user.id);
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ saved: false });
	} else {
		// 保存追加
		const { error } = await supabase
			.from('tip_saves')
			.insert({ tip_id: id, user_id: user.id });
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ saved: true });
	}
}
