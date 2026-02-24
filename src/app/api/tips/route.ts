import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const champion = searchParams.get('champion');
	const opponent = searchParams.get('opponent');
	const sort = searchParams.get('sort') ?? 'likes';
	const savedOnly = searchParams.get('saved') === 'true';

	if (!champion || !opponent) {
		return NextResponse.json({ error: 'Missing params' }, { status: 400 });
	}

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	let query = supabase
		.from('matchup_tips')
		.select(`
			id, content, likes_count, saves_count, created_at,
			profiles(username)
		`)
		.eq('champion_id', champion)
		.eq('opponent_id', opponent);

	if (sort === 'newest') {
		query = query.order('created_at', { ascending: false });
	} else {
		query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
	}

	const { data: tips, error } = await query.limit(50);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });

	// ログイン中なら自分のいいね・保存状態を付与
	let likedIds = new Set<string>();
	let savedIds = new Set<string>();
	let savedTipIds = new Set<string>();

	if (user) {
		const tipIds = (tips ?? []).map((t: any) => t.id);
		const [likesRes, savesRes] = await Promise.all([
			supabase.from('tip_likes').select('tip_id').eq('user_id', user.id).in('tip_id', tipIds),
			supabase.from('tip_saves').select('tip_id').eq('user_id', user.id).in('tip_id', tipIds),
		]);
		likedIds = new Set(likesRes.data?.map((r: any) => r.tip_id) ?? []);
		savedIds = new Set(savesRes.data?.map((r: any) => r.tip_id) ?? []);

		// 保存済みフィルター用に全保存を取得
		if (savedOnly) {
			const { data: allSaves } = await supabase
				.from('tip_saves')
				.select('tip_id')
				.eq('user_id', user.id)
				.eq('champion_id', champion)
				.eq('opponent_id', opponent);
			// tip_savesにchampion_id/opponent_idがないため、tip_idで絞る
			savedTipIds = new Set(savesRes.data?.map((r: any) => r.tip_id) ?? []);
		}
	}

	let result = (tips ?? []).map((tip: any) => ({
		id: tip.id,
		content: tip.content,
		likesCount: tip.likes_count,
		savesCount: tip.saves_count,
		createdAt: tip.created_at,
		username: tip.profiles?.username ?? '???',
		isLiked: likedIds.has(tip.id),
		isSaved: savedIds.has(tip.id),
		isOwn: tip.user_id === user?.id,
	}));

	if (savedOnly && user) {
		result = result.filter(t => savedIds.has(t.id));
	}

	return NextResponse.json({ tips: result, userId: user?.id ?? null });
}

export async function POST(request: NextRequest) {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const { champion_id, opponent_id, content } = await request.json();
	if (!champion_id || !opponent_id || !content) {
		return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
	}

	const { data, error } = await supabase
		.from('matchup_tips')
		.insert({ user_id: user.id, champion_id, opponent_id, content })
		.select(`id, content, likes_count, saves_count, created_at, profiles(username)`)
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });

	return NextResponse.json({
		tip: {
			id: data.id,
			content: data.content,
			likesCount: data.likes_count,
			savesCount: data.saves_count,
			createdAt: data.created_at,
			username: (data.profiles as any)?.username ?? '???',
			isLiked: false,
			isSaved: false,
			isOwn: true,
		}
	});
}
