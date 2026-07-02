import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
import type mongoose from 'mongoose';
import { supabaseAdmin } from './supabaseAdmin.js';
import { User } from './db/index.js';

// Fields attached to the request by the verifyToken middleware.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Mongo user _id — application data is still keyed by this. */
      userId?: mongoose.Types.ObjectId;
      userEmail?: string;
      /** Supabase auth user id (UUID). */
      authUserId?: string;
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

// Token verification middleware.
//
// Authentication lives in Supabase, but application data is still keyed by
// the Mongo user _id (projects/products/pvDetails reference it). Until the
// data moves to Postgres, this middleware bridges the two identities: it
// validates the Supabase access token, then finds (or creates, on a user's
// first request) the matching Mongo user by email and exposes its _id as
// `req.userId` for the route handlers.
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Accept both "Bearer <token>" and a bare token.
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.email) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const authUser = data.user;
    let user = await User.findOne({ email: authUser.email });
    if (!user) {
      user = await new User({
        email: authUser.email,
        displayName: authUser.user_metadata?.display_name,
      }).save();
    }

    req.userId = user._id;
    req.userEmail = authUser.email;
    req.authUserId = authUser.id;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// The Mongo user _id resolved by verifyToken. Every route that calls this
// already runs behind the verifyToken middleware.
export function getUserIdFromtoken(req: Request): mongoose.Types.ObjectId | undefined {
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
    return '0' + number;
  } else {
    return number.toString();
  }
}
