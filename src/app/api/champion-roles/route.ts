import { NextResponse } from 'next/server';
import { getPrimaryRoles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
	const rows = getPrimaryRoles();
	const result: Record<string, string> = {};
	for (const row of rows) {
		result[row.champion_id] = row.role;
	}
	return NextResponse.json(result);
}
