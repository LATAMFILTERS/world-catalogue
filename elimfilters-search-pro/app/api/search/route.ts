import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.replace(/[-.\s]/g, '').toUpperCase() || '';

    if (query.length < 3) return NextResponse.json([]);

    const results = await prisma.filter.findMany({
      where: {
        OR: [
          { sku: { contains: query, mode: 'insensitive' } },
          { cross_references: { some: { code: { contains: query, mode: 'insensitive' } } } }
        ]
      },
      include: { cross_references: true },
      take: 10
    });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 });
  }
}