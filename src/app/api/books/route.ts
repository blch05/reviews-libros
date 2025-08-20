import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { query } = await request.json();
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return NextResponse.json({ items: data.items || [] });
}
