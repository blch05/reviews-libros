"use server";

import { NextResponse } from "next/server";

let reviews: Record<string, Array<any>> = {};

export async function GET(request: Request) {
  const { bookId } = Object.fromEntries(new URL(request.url).searchParams);
  return NextResponse.json({ reviews: reviews[bookId] || [] });
}

export async function PUT(request: Request) {
  const { bookId, review } = await request.json();
  if (!reviews[bookId]) reviews[bookId] = [];
  reviews[bookId].push({ ...review, votes: 0 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { bookId, reviewIndex, vote } = await request.json();
  if (reviews[bookId] && reviews[bookId][reviewIndex]) {
    reviews[bookId][reviewIndex].votes += vote;
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false });
}
