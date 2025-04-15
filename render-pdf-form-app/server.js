const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const { fullName, email, message } = req.body;

  // Generate HTML content for the PDF
  const htmlContent = `
    <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PalletMAX Application Form</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>PalletMAX&trade; Application Data Sheet</h1>
    <p style="text-align: center;">Need Help? Call the experts at <strong> Erie Technical Systems Inc. 814-899-2103</strong></p>
    <form onsubmit="event.preventDefault(); downloadFormData();">

      <h2>Customer Contact Details</h2>
</br>
</br>
  <div class="form-container">

    <!-- Left Column -->

    <div class="form-column">
      <div class="form-group">
        <label for="company">Company</label>
        <input type="text" id="company" name="company">
      </div>
      <div class="form-group">
        <label for="address">Address</label>
        <input type="text" id="address" name="address">
      </div>
      <div class="form-group">
        <label for="city">City</label>
        <input type="text" id="city" name="city">
      </div>
      <div class="form-group">
        <label for="state">State</label>
        <input type="text" id="state" name="state">
      </div>
      <div class="form-group">
        <label for="zip">Zip</label>
        <input type="text" id="zip" name="zip">
      </div>
    </div>

    <!-- Right Column -->

    <div class="form-column">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name">
      </div>
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" name="title">
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email">
      </div>
      <div class="form-group">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" name="phone">
      </div>
    </div>
  </div>
</br>

<!-- Pallet Information Table -->

<table>
    <tr>
      <th>Pallet</th>
      <th>Width</th>
      <th>Depth</th>
      <th>Height</th>
      <th>Material</th>
      <th>Style</th>
    </tr>

    <!-- Row 1 -->

    <tr>
      <td>1</td>
      <td><input type="text2" name="width1"> in.</td>
      <td><input type="text2" name="depth1"> in.</td>
      <td><input type="text2" name="height1"> in.</td>
      <td>
        <div class="radio-group">
          <label><input type="radio" name="material1" value="wood"> Wood</label>
          <label><input type="radio" name="material1" value="plastic"> Plastic</label>
          <label><input type="radio" name="material1" value="other"> Other</label>
        </div>
      </td>
      <td>
        <div class="radio-group">
          <label><input type="radio" name="style1" value="4way"> 4-Way</label>
          <label><input type="radio" name="style1" value="2way"> 2-Way</label>
          <label><input type="radio" name="style1" value="nested"> Nested</label>
        </div>
      </td>
    </tr>

    <!-- Row 2 -->

    <tr>
      <td>2</td>
      <td><input type="text2" name="width2"> in.</td>
      <td><input type="text2" name="depth2"> in.</td>
      <td><input type="text2" name="height2"> in.</td>
      <td>
        <div class="radio-group">
          <label><input type="radio" name="material2" value="wood"> Wood</label>
          <label><input type="radio" name="material2" value="plastic"> Plastic</label>
          <label><input type="radio" name="material2" value="other"> Other</label>
        </div>
      </td>
      <td>
        <div class="radio-group">
          <label><input type="radio" name="style2" value="4way"> 4-Way</label>
          <label><input type="radio" name="style2" value="2way"> 2-Way</label>
          <label><input type="radio" name="style2" value="nested"> Nested</label>
        </div>
      </td>
    </tr>
  </table>
  <div class="container">
<table>

    <!-- No Headers, Row 1 -->

    <tr>
      <th>Pallet Weight (each):</th>
      <td><input type="text2" name="pweight"> lbs.</td>
      <th>Inlet / Discharge Height:</th>
      <td><input type="text2" name="disheight"> in.</td>
   </tr>

    <!-- Row 2 -->

    <tr>
      <th>Pallet Stack Count:</th>
      <td><input type="text2" name="stack"> pallets</td>
      <th>Discharge Rate:</th>
      <td><input type="text2" name="disrate"> per hour.</td>
    </tr>

    <!-- Row 3 -->

<tr>
<th colspan="2">Primary Operation</th>
<td class="checkbox-group">
          <label><input type="checkbox" name="operation" value="dispenser"> Dispenser</label>
</td>
<td class="checkbox-group">
          <label><input type="checkbox" name="operation" value="stacker"> Stacker</label>
</td>
</tr>
</table>
</div>
<!-- Discharge Direction, Does Image Work? -->

<div class="section-container">
    <!-- LEFT SIDE -->
    <div class="left-side">
      <div class="discharge-direction">
        <h3>Discharge Direction:</h3>
        <div class="discharge-content">
          <div class="radio-group">
            <label><input type="radio" name="discharge_direction" value="straight"> Straight</label>
            <label><input type="radio" name="discharge_direction" value="left"> Left</label>
            <label><input type="radio" name="discharge_direction" value="right"> Right</label>
          </div>
          <div class="image-container">
            <img src="Pallet_Direction.png" alt="Pallet Direction Diagram">
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right-side">
      <div class="optional-features">
        <h3>Optional Features:</h3>
        <div class="checkbox-group">
          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_outlet_cdlr" value="yes">
              Outlet Staging Conveyors (CDLR)
            </span>
            <input type="text" name="optional_outlet_cdlr_qty" placeholder="Quantity">
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_inlet_cdlr" value="yes">
              Inlet Staging Conveyors (CDLR)
            </span>
            <input type="text" name="optional_inlet_cdlr_qty" placeholder="Quantity">
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_manual_door" value="yes">
              Manual Door
            </span>
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_auto_door" value="yes">
              Automatic Door
            </span>
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_slip_sheet" value="yes">
              Slip Sheet Dispenser
            </span>
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_guarding" value="yes">
              Guarding Package
            </span>
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_safety_fence_door" value="yes">
              Safety Fence With Door
            </span>
          </label>

          <label>
            <span class="checkbox-label">
              <input type="checkbox" name="optional_safety_fence_lc" value="yes">
              Safety Fence With Light Curtain
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>

 <!-- UTILITIES SECTION -->
<div class="utilities-section">
  <h3>Utilities</h3>
  <div class="utilities-columns">
    <!-- ENCLOSURE COLUMN -->
    <div class="utility-column">
      <h4>Enclosure</h4>
      <label><input type="radio" name="enclosure" value="nema_4_12"> NEMA 4/12</label>
      <label><input type="radio" name="enclosure" value="nema_4x_ss"> NEMA 4X SS</label>
      <label>
        <input type="radio" name="enclosure" value="other">
        Other:
        <input type="text" name="enclosure_other" placeholder="Specify">
      </label>
    </div>

    <!-- VOLTAGE COLUMN -->
    <div class="utility-column">
      <h4>Voltage</h4>
      <label><input type="radio" name="voltage" value="460vac"> 460VAC</label>
      <label><input type="radio" name="voltage" value="220vac"> 220VAC</label>
      <label>
        <input type="radio" name="voltage" value="other">
        Other:
        <input type="text" name="voltage_other" placeholder="Specify">
      </label>
    </div>
  </div>

      <h2>Additional Notes</h2>
      <textarea class="large-textarea" name="notes" rows="6" placeholder="Add additional information here..."></textarea>

<div class="submit-button">
      <button type="submit">Download Completed Form</button>
</div>

<p style="text-align: center;"><strong>This button does not send information to Erie Technical Systems.</strong></p>
<p style="text-align: center;">The completed form will be automatically downloaded in a consolidated .txt file. Please send this file and any relevant pictures or additional files to <a href="mailto:info@erietechnicalsystems.com">info@erietechnicalsystems.com</a> and we will be with you as soon as possible!</p>

 </form>
    <footer>
      <p>Erie Technical Systems Inc. | <a href="mailto:info@erietechnicalsystems.com">info@erietechnicalsystems.com</a> | <a href="http://www.bulkfilling.com">www.bulkfilling.com</a></p>
    </footer>
  </div>
</body>
  `;

  try {
    // Launch Puppeteer to generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Configure Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'Gmail', // e.g., Gmail, Outlook
      auth: {
        user: 'JeremieK@ErieTechnicalSystems.com',
        pass: 'ywbu jegj axmh yxob',
      },
    });

    // Send email with PDF attachment
    await transporter.sendMail({
      from: '"Application Form" <JeremieK@ErieTechnicalSystems.com>',
      to: 'JeremieK@ErieTechnicalSystems.com',
      subject: 'New ADS Submission',
      text: 'Please find the attached PDF of the application submission.',
      attachments: [
        {
          filename: 'ADS.pdf',
          content: pdfBuffer,
        },
      ],
    });

    res.send('Application submitted successfully!');
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).send('An error occurred while processing your application.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
