<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BOHOLIGHT Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #000;
            font-size: 14px; /* Reduced base font size */
        }

        .container {
            max-width: 600px;
            margin: auto;
        }

        .logo {
            text-align: center;
            margin-bottom: 10px;
        }

        .logo-text {
            font-size: 28px; /* Reduced */
            font-weight: bold;
        }
        .logo-text span:first-child { color: #00923F; }
        .logo-text span:last-child { color: #FF6A00; }

        .company-info {
            text-align: center;
            margin-bottom: 25px;
            font-size: 13px; /* Reduced */
        }

        .green-title {
            color: #00923F;
            font-weight: bold;
            font-size: 18px; /* Reduced */
            text-align: center;
        }

        .green-subtitle {
            color: #00923F;
            text-align: center;
            font-size: 13px; /* Reduced */
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            font-size: 14px; /* Reduced */
        }

        th{
            text-align: left;
            width: 35%;
        }

        td, th {
            padding: 4px 0; /* Slightly smaller padding */
        }

        .section-title {
            margin-top: 15px;
            font-weight: bold;
            font-size: 15px; /* Reduced */
        }

        .amount-box {
            margin-top: 20px;
        }

        .amount-box td {
            padding: 6px 0; /* Smaller padding */
        }

        .bold {
            font-weight: bold;
        }

        .right {
            text-align: right;
        }

        .footer-note {
            text-align: center;
            margin-top: 25px;
            font-size: 12px; /* Reduced */
            font-weight: bold;
        }

        hr {
            margin: 10px 0;
        }
    </style>
</head>
<body>

<div class="container">

    <!-- LOGO -->
    <div class="logo">
        <div class="logo-text">
            <span>BOHO</span><span>LIGHT</span>
        </div>
    </div>

    <!-- COMPANY INFO -->
    <div class="company-info">
        Ramon Enerio St., Poblacion III, Tagbilaran City, Bohol 6300<br>
        VAT REG. TIN 005-372-703-00000<br>
        For inquiries contact: (038)411-3503, 235-5781, 235-5809, 501-7762
    </div>

    <!-- RECEIPT TITLE -->
    <div class="green-title">COLLECTION RECEIPT</div>
    <div class="green-subtitle">CR000000000136792<br>*** Re-Printed ***</div>

    <!-- DETAILS TABLE -->
    <table>
        <tr><th>Date and Time:</th><td>August 27, 2025 12:00:11 AM</td></tr>
        <tr><th>Received From:</th><td>PIZANA, JOEL T.</td></tr>
        <tr><th>Account Number:</th><td>22454-00</td></tr>
        <tr><th>TIN:</th><td></td></tr>
        <tr><th>OSCA/SC/Other ID No.:</th><td></td></tr>
        <tr><th>SC Signature:</th><td></td></tr>
    </table>

    <br>

    <table>
        <tr><th>Address:</th><td>BLK 14 LOT 16 PH2 CAMELLA BOOL</td></tr>
        <tr><th>Business Name:</th><td>PIZANA, JOEL T.</td></tr>
        <tr><th>Business Style:</th><td></td></tr>
        <tr><th>Description:</th><td>Payment of Electricity</td></tr>
        <tr><th>Mode of Payment:</th><td>CASH</td></tr>
    </table>

    <!-- AMOUNT SECTION -->
    <div class="amount-box">
        <table>
            <tr><td>Vatable Sales</td><td class="right">2,840.91</td></tr>
            <tr><td>VAT-Exempt Sales</td><td class="right">127.18</td></tr>
            <tr><td>Zero Rated Sales</td><td class="right">--</td></tr>
            <tr><td>VAT Amount</td><td class="right">239.52</td></tr>

            <tr><td class="bold">Total Sales (Vat Inclusive)</td><td class="right bold">3,207.60</td></tr>

            <tr><td>Less: SC Discount</td><td class="right">--</td></tr>
            <tr><td>Less: Withholding Tax</td><td class="right">--</td></tr>
        </table>

        <br>

        <table>
            <tr>
                <td class="bold">Amount Due:</td>
                <td class="right bold" style="font-size:28px;">3,207.60</td>
            </tr>
        </table>
    </div>

    <br><br>

    <table>
        <tr><td>Permit Number:</td><td>AC_123_022025_000254</td></tr>
        <tr><td>Range of Approved Numbers:</td><td>CR00000000000001 to CR99999999999999</td></tr>
        <tr><td>Date Issued:</td><td>February 14, 2025</td></tr>
    </table>

    <div class="footer-note">
        *** THIS IS A SYSTEM GENERATED RECEIPT ***<br>
        THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAX
    </div>

</div>

</body>
</html>
