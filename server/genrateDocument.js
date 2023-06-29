import PDFDocument from 'pdfkit';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Product } from './db/index.js';
import {fromEmail} from './commonFunctions.js'

export async function generateAndSendPDF(data, email, projectDetails) {
  const doc = new PDFDocument();

  // Set up the PDF document
  doc.fontSize(16).text('PV Value Report', { align: 'center' });
  
  // Generate the product details table
  generateProductDetailsTable(doc, data, projectDetails);

  // Generate the total PV value
  const totalPVValue = calculateTotalPVValue(data);
  doc.moveDown().fontSize(14).text(`Total PV Value: ${totalPVValue}`);

  // Generate some general text about report generation
  doc.moveDown().fontSize(12).text('This report provides an overview of the PV value for the given products.');

  // Generate and embed the chart image for each product
  for (const productData of data) {
    const productdetails = await Product.findOne({id: productData.product}).lean();
    const chartImage = await generateChartImage(productData.hourWiseData);
    const page = doc.addPage()
    page.fontSize(12).text(`Product name ${productdetails?.name}`);
    page.image(chartImage, { width: 500, height: 300, align: 'center' });
  }

  // Save the PDF to a file
  const pdfPath = 'pv_report.pdf';
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.end();

  // Send the PDF via email
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
  });

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: 'PV Value Report',
    text: `
    Dear recipient,

    We are pleased to provide you with the PV Value Report. This report contains detailed information 
    about the PV value of the products in your project.

    Please find the attached PDF file named "pv_report.pdf" that contains the report.

    If you have any questions or require further assistance, please don't hesitate to reach out to us. 
    We are always here to help.

    Thank you for your attention, and we hope this report assists you in your project.

    Best regards,
    PV Calculation Team`,
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

async function generateProductDetailsTable(doc, data, projectDetails) {
  doc.moveDown().fontSize(14).text('Product Details');

  // Table headers
  await doc.moveDown();
  await doc.fontSize(12).text('Project name', { width: 100, align: 'left' });
  await doc.text('Product name', { width: 100, align: 'left' });
  await doc.text('PV Value', { width: 100, align: 'left' });

  // Table rows
  for (const productData of data) {
    const productdetails = await Product.findOne({id: productData.product}).lean();
    await doc.moveDown();
    await doc.fontSize(12).text(projectDetails?.name, { width: 100, align: 'left' });
    await doc.text(productdetails?.name, { width: 100, align: 'left' });
    // Calculate and display the PV value for the product

    const pvValue = await calculateTotalPVValue([productData]);
    await doc.text(pvValue.toString(), { width: 100, align: 'left' });
  }
}

  
function calculateTotalPVValue(data) {
  let totalPVValue = 0;
  for (const productData of data) {
    for (const entry of productData.hourWiseData) {
      totalPVValue += entry.pvValue;
    }
  }
  return totalPVValue;
}

async function generateChartImage(hourWiseData) {
  const width = 800;
  const height = 400;

  // Prepare chart data
  const labels = hourWiseData.map((entry) => entry.dateAndTime);
  const values = hourWiseData.map((entry) => entry.pvValue);

  // Set up Chart.js configuration
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'PV Value',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: `Date/Time`,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'PV Value',
          },
        },
      },
    },
  };

  // Set up the chart canvas
  const chartCallback = (ChartJS) => {
    if (!ChartJS?.defaults?.global) {
      console.log('ChartJS', ChartJS?.defaults);
      return;
    }
    ChartJS.defaults.global.defaultFontFamily = 'Arial';
    ChartJS.defaults.global.defaultFontSize = 16;
    ChartJS.plugins.register({
      beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, chart.width, chart.height);
      },
    });
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
  return chartJSNodeCanvas.renderToBuffer(configuration);
}



  