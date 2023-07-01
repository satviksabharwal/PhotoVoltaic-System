import jwt from 'jsonwebtoken';

// Token verification middleware
export function verifyToken(req, res, next) {
  // Get the token from the request header
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify the token
  jwt.verify(token, 'secretKey', (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Token is valid, you can access the decoded payload if needed
    // For example, you can get the user ID from `decodedToken.userId`

    next();
  });
}

export function getUserIdFromtoken(req) {
  const token = req.header('Authorization');
  if (!token) {
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    const userId = decoded.userId;
    return userId;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function calculateElectricityProduced(
  product,
  weatherData,
  opitionalSolarVal
) {
  // Extract relevant information from the product and weather data
  const { area } = product;
  const data = weatherData;

  // Calculate the total electricity produced for the given product
  const solarIrradiance = data?.dni;
  const unixTimestamp = data?.ts;
  const dateTs = new Date(unixTimestamp * 1000);
  // Hours part from the timestamp
  const hoursTs = dateTs.getHours();
  const electricityProduced =
    ((hoursTs ?? opitionalSolarVal) *
      area *
      (solarIrradiance ?? opitionalSolarVal)) /
    1000;
  return electricityProduced;
}

export function getRandomNumber() {
  // Generate a random decimal between 0 and 1
  var randomDecimal = Math.random();

  // Scale the random decimal to the range 1-10 (inclusive)
  var randomNumber = Math.floor(randomDecimal * 10) + 1;

  return randomNumber;
}

export function convertToDoubleDigit(number) {
  if (number < 10) {
    return '0' + number;
  } else {
    return number.toString();
  }
}
export const weathertoken = '2a70c306e8814c639c7a7f34521670aa';
export const fromEmail = 'satviksabharwal7@gmail.com';
