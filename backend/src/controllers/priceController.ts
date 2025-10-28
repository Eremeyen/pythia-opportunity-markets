import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { PricePoint, PricePointDocument } from '../models/PricePoint';
import { ensureMarketIsPublic } from '../services/marketAccess';

const parseLimit = (value?: string): number => {
  const fallback = 500;
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 5000) : fallback;
};

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const createPricePoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { price, market, source, metadata, timestamp } = req.body;

    if (typeof price !== 'number' || Number.isNaN(price)) {
      res.status(400).json({ message: 'price must be a number' });
      return;
    }

    if (typeof market !== 'string' || !market) {
      res.status(400).json({ message: 'market must be provided' });
      return;
    }

    const timestampDate = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(timestampDate.getTime())) {
      res.status(400).json({ message: 'timestamp must be a valid date' });
      return;
    }

    const created = await PricePoint.create({
      price,
      market,
      source,
      metadata,
      timestamp: timestampDate
    });

    res.status(201).json({
      id: created.id,
      price: created.price,
      market: created.market,
      source: created.source,
      metadata: created.metadata,
      timestamp: created.timestamp
    });
  } catch (error) {
    console.error('[priceController] create error', error);
    res.status(500).json({ message: 'Failed to save price point' });
  }
};

export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { market, source, from, to } = req.query as Record<string, string | undefined>;
    const limit = parseLimit(req.query.limit as string | undefined);

    if (!market) {
      res.status(400).json({ message: 'market query parameter is required' });
      return;
    }

    try {
      await ensureMarketIsPublic(market);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Market window is still private';
      res.status(403).json({ message });
      return;
    }

    const filters: FilterQuery<PricePointDocument> = { market };
    if (source) filters.source = source;

    const fromDate = parseDate(from);
    const toDate = parseDate(to);

    if (fromDate || toDate) {
      filters.timestamp = {};
      if (fromDate) filters.timestamp.$gte = fromDate;
      if (toDate) filters.timestamp.$lte = toDate;
    }

    const data = await PricePoint.find(filters)
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();

    res.json({
      count: data.length,
      data
    });
  } catch (error) {
    console.error('[priceController] history error', error);
    res.status(500).json({ message: 'Failed to fetch price history' });
  }
};
