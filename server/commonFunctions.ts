import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabaseAdmin.js';

// Fields attached to the request by the verifyToken middleware.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Supabase auth user id (UUID) — application data is keyed by this. */
      userId?: string;
      userEmail?: string;
    }
  }
}

/** One hourly record from the Weatherbit history API. */
export interface WeatherHour {
  datetime?: string;
  dni?: number;
  ts?: number;
}

export interface WeatherHistoryResponse {
  data?: WeatherHour[];
}

const { WEATHER_API_TOKEN, WEATHER_API_TOKEN_REGISTERED_EMAIL_ID } =
  process.env;

export const weathertoken = WEATHER_API_TOKEN;
export const fromEmail = WEATHER_API_TOKEN_REGISTERED_EMAIL_ID;

// Token verification middleware: validates the Supabase access token and
// exposes the auth user's id/email to route handlers.
export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Accept both "Bearer <token>" and a bare token.
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.email) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }

    const authUser = data.user;

    // Profiles are normally created by a DB trigger at signup; this upsert
    // self-heals accounts that predate the trigger so foreign keys on
    // projects/products never dangle.
    await supabaseAdmin.from('profiles').upsert(
      {
        id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata?.display_name ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    req.userId = authUser.id;
    req.userEmail = authUser.email;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// The Supabase user id resolved by verifyToken. Every route that calls this
// already runs behind the verifyToken middleware.
export function getUserIdFromtoken(req: Request): string | undefined {
  return req.userId;
}

export async function calculateElectricityProduced(
  product: { area: number },
  weatherData: WeatherHour | undefined,
  opitionalSolarVal: number
): Promise<number> {
  // Extract relevant information from the product and weather data
  const { area } = product;
  const data = weatherData;

  // Calculate the total electricity produced for the given product
  const solarIrradiance = data?.dni;
  const unixTimestamp = data?.ts;
  const dateTs = new Date((unixTimestamp ?? NaN) * 1000);
  // Hours part from the timestamp
  const hoursTs = dateTs.getHours();
  const electricityProduced =
    ((hoursTs ?? opitionalSolarVal) *
      area *
      (solarIrradiance ?? opitionalSolarVal)) /
    1000;
  return electricityProduced;
}

export function getRandomNumber(): number {
  // Generate a random decimal between 0 and 1
  const randomDecimal = Math.random();

  // Scale the random decimal to the range 1-10 (inclusive)
  const randomNumber = Math.floor(randomDecimal * 10) + 1;

  return randomNumber;
}

export function convertToDoubleDigit(number: number): string {
  if (number < 10) {
    return `0${number}`;
  }
  return number.toString();
}
