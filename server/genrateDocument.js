import PDFDocument from 'pdfkit';
import fs from 'fs';
import nodemailer from 'nodemailer';
import request from 'request-promise-native';

export async function generateAndSendPDF(data, email) {
  const doc = new PDFDocument();

  // Prepare chart data
  const chartData = data.hourWiseData.map((entry) => {
    return {
      t: new Date(entry.dateAndTime),
      y: entry.pvValue,
    };
  });

  // Set up the PDF document
  doc.fontSize(16).text('PV Value Chart', { align: 'center' });

  // Generate and embed the chart image
  const chartImage = await getChartImage(chartData);
  doc.image(chartImage, { width: 500, height: 300, align: 'center' });

  // Save the PDF to a file
  const pdfPath = 'pv_chart.pdf';
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.end();

  // Send the PDF via email
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
  });

  const mailOptions = {
    from: 'nagu@yopmail.com',
    to: 'pvvaluetestmail@yopmail.com',
    subject: 'PV Value Chart',
    text: 'Please find the attached PDF with the PV Value chart.',
    attachments: [{ filename: pdfPath, path: pdfPath }],
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

async function getChartImage(chartData) {
  // Implement your chart generation logic here
  // This could involve using charting libraries like Chart.js or D3.js
  // Return the chart image in a format that can be embedded in the PDF

  // Dummy implementation generating a placeholder image using dummyimage.com
  const placeholderImageUrl = `https://dummyimage.com/500x300.png/000/ffffff&text=Chart+Placeholder`;

  // Download the image file from the URL
  const imagePath = 'chart_placeholder.png';
  await request.get(placeholderImageUrl).pipe(fs.createWriteStream(imagePath));

  return imagePath;
}

// Example usage
const data = [
  {
    id: '0470b219-1e66-4dc8-9a28-944112f314bd',
    product: '3cd3ed19-b58b-453b-8ef5-7c17b3b4f263',
    project: '540e7e58-33b2-4224-99ce-2b294a1d45fc',
    user: '6491bc004ea451fa4aa348a2',
    hourWiseData: [
      {
        dateAndTime: '2023-06-27:10',
        pvValue: 8000,
        powerPeak: 10,
        area: 20,
        inclination: 10,
        solarRad: 4,
      },
      {
        dateAndTime: '2023-06-27:07',
        pvValue: 8000,
        powerPeak: 10,
        area: 20,
        inclination: 10,
        solarRad: 4,
      },
      {
        dateAndTime: '2023-06-27:08',
        pvValue: 8000,
        powerPeak: 10,
        area: 20,
        inclination: 10,
        solarRad: 4,
      },
      {
        dateAndTime: '2023-06-27:09',
        pvValue: 8000,
        powerPeak: 10,
        area: 20,
        inclination: 10,
        solarRad: 4,
      },
    ],
  },
];

generateAndSendPDF(data[0], 'nagu@yopmail.com')
  .then(() => {
    console.log('PDF sent successfully!');
  })
  .catch((error) => {
    console.error('Error sending PDF:', error);
  });
