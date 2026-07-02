import PDFDocument from 'pdfkit';
import fs from 'fs';
import nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { supabaseAdmin } from './supabaseAdmin.js';
import { fromEmail } from './commonFunctions.js';
import type { LegacyPvHourEntry } from './mappers.js';

/** The subset of a PvDetails record the report needs. */
interface ReportPvData {
  product: string;
  hourWiseData: LegacyPvHourEntry[];
}

/** Batch-fetches product names so the report only queries once. */
async function fetchProductNames(productIds: string[]): Promise<Map<string, string>> {
  if (!productIds.length) return new Map();
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .in('id', productIds);
  const rows = (data as { id: string; name: string }[] | null) ?? [];
  return new Map(rows.map((row) => [row.id, row.name]));
}

/** The subset of a project/product record the report needs. */
interface ReportSubject {
  name?: string;
}

export async function generateAndSendPDF(
  data: ReportPvData[],
  email: string,
  projectDetails: ReportSubject | null | undefined
): Promise<SentMessageInfo> {
  const doc = new PDFDocument();

  // Set up the PDF document
  doc.fontSize(16).text('PV Value Report', { align: 'center' });

  const productNames = await fetchProductNames(data.map((productData) => productData.product));

  // Generate the product details table
  generateProductDetailsTable(doc, data, projectDetails, productNames);

  // Generate the total PV value
  const totalPVValue = calculateTotalPVValue(data);
  doc.moveDown().fontSize(14).text(`Total PV Value: ${totalPVValue}`);

  // Generate some general text about report generation
  doc.moveDown().fontSize(12).text('This report provides an overview of the PV value for the given products.');

  // Generate and embed the chart image for each product
  const productPageData = await Promise.all(
    data.map(async (productData) => ({
      productName: productNames.get(productData.product) ?? '',
      chartImage: await generateChartImage(productData.hourWiseData),
    }))
  );

  productPageData.forEach(({ productName, chartImage }) => {
    const page = doc.addPage();
    page.fontSize(12).text(`Product name ${productName}`);
    page.image(chartImage, { width: 500, height: 300, align: 'center' });
  });

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

  return new Promise<SentMessageInfo>((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

function generateProductDetailsTable(
  doc: PDFKit.PDFDocument,
  data: ReportPvData[],
  projectDetails: ReportSubject | null | undefined,
  productNames: Map<string, string>
) {
  doc.moveDown().fontSize(14).text('Product Details');

  // Table headers
  doc.moveDown();
  doc.fontSize(12).text('Project name', { width: 100, align: 'left' });
  doc.text('Product name', { width: 100, align: 'left' });
  doc.text('PV Value', { width: 100, align: 'left' });

  // Table rows
  data.forEach((productData) => {
    doc.moveDown();
    doc.fontSize(12).text(projectDetails?.name ?? '', { width: 100, align: 'left' });
    doc.text(productNames.get(productData.product) ?? '', { width: 100, align: 'left' });
    doc.text(calculateTotalPVValue([productData]).toString(), { width: 100, align: 'left' });
  });
}

function calculateTotalPVValue(data: ReportPvData[]): number {
  return data.reduce(
    (total, productData) =>
      total + productData.hourWiseData.reduce((sum, entry) => sum + entry.pvValue, 0),
    0
  );
}

async function generateChartImage(hourWiseData: LegacyPvHourEntry[]): Promise<Buffer> {
  const width = 800;
  const height = 400;

  // Prepare chart data
  const labels = hourWiseData.map((entry) => entry.dateAndTime);
  const values = hourWiseData.map((entry) => entry.pvValue);

  // Set up Chart.js configuration
  const configuration = {
    type: 'bar' as const,
    data: {
      labels,
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

  // Set up the chart canvas. The callback targets the Chart.js v2 global
  // defaults API and no-ops (with a log) on v3+, so it is typed loosely.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartCallback = (ChartJS: any) => {
    if (!ChartJS?.defaults?.global) {
      console.log('ChartJS', ChartJS?.defaults);
      return;
    }
    ChartJS.defaults.global.defaultFontFamily = 'Arial';
    ChartJS.defaults.global.defaultFontSize = 16;
    ChartJS.plugins.register({
      beforeDraw: (chart: any) => {
        const ctx = chart.canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, chart.width, chart.height);
      },
    });
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
  return chartJSNodeCanvas.renderToBuffer(configuration);
}
