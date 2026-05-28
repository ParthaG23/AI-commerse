import { getSearchParamsFromAI, groqai } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    const queryType = await groqai("classifyQuery", query);

    if (queryType.toLowerCase().includes('general question')) {
      const generalAnswer = await groqai("generalAnswer", query);
      return NextResponse.json({ queryType, generalAnswer }, { status: 200 });
    } else {
      const searchParams = await getSearchParamsFromAI(query);
      return NextResponse.json({ queryType, searchParams }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
