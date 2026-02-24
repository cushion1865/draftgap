import { NextResponse } from 'next/server';
import { getAvailablePatches } from '@/lib/db';

export async function GET() {
	try {
		const patches = getAvailablePatches();
		return NextResponse.json({ patches });
	} catch (error) {
		console.error('Patches API error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
