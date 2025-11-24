<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOHOL LIGHT COMPANY, INC. - Contract for Electric Service</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.4;
            background-color: #fff;
            color: #000;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .company-motto {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .contract-title {
            font-weight: bold;
            font-size: 18px;
            text-decoration: underline;
            margin-bottom: 20px;
        }

        .form-section {
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
        }

        .form-row {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
        }

        .form-label {
            font-weight: bold;
            min-width: 120px;
        }

        .form-input {
            border-bottom: 1px solid #000;
            flex: 1;
            padding: 2px;
            margin-left: 10px;
        }

        .form-checkbox {
            width: 20px;
            height: 20px;
            border: 1px solid #000;
            margin-left: 10px;
            display: inline-block;
            vertical-align: middle;
        }

        .two-column {
            display: flex;
            gap: 20px;
        }

        .column {
            flex: 1;
        }

        .load-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .load-table th,
        .load-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }

        .load-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        .contract-intro {
            margin: 20px 0;
            text-align: justify;
        }

        .section-title {
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0 10px 0;
            text-decoration: underline;
        }

        .clause {
            margin-bottom: 15px;
            text-align: justify;
        }

        .clause-number {
            font-weight: bold;
            margin-right: 10px;
        }

        .sub-clause {
            margin: 5px 0 5px 20px;
        }

        .deposit-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .deposit-table th,
        .deposit-table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
        }

        .deposit-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }

        .signature-block {
            text-align: center;
            width: 48%;
        }

        .signature-line {
            border-bottom: 1px solid #000;
            /* height: 40px; */
            /* margin: 40px 0 5px 0; */
        }

        .acknowledgment {
            margin-top: 40px;
            /* border: 1px solid #000; */
            /* padding: 20px; */
        }

        .page-number {
            text-align: center;
            margin: 30px 0;
            font-weight: bold;
        }

        .formula {
            text-align: center;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
        }

        .italic {
            font-style: italic;
        }

        .bold {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="data:image/png; base64, {{ base64_encode(file_get_contents(storage_path('app/public/headers/blci_header.png'))) }}" style="height: 80px; margin-bottom: 30px">
        <div class="city-name" style="margin-bottom: 30px; margin-top: -20px">TAGBILARAN CITY, PHILIPPINES</div>
        <div class="contract-title">CONTRACT FOR ELECTRIC SERVICE</div>
    </div>

    <div class="form-section">
        <div class="form-row">
            <span class="form-label">CUSTOMER:</span>
            <div class="form-input">{{ $contract->customerApplication->full_name }}</div>
        </div>
        <div class="form-row">
            <span class="form-label">Installation Address:</span>
            <div class="form-input">{{ $contract->customerApplication->full_address }}</div>
        </div>
        <div class="form-row">
        </div>
        <div class="form-row">
            <span class="form-label">Landline No.</span>
            <div class="form-input" style="margin-right: 10px;">
                {{ $contract->customerApplication->tel_no_1 }}
                {{ $contract->customerApplication->tel_no_2 ? ", " . $contract->customerApplication->tel_no_2 : "" }}
            </div>
            <span class="form-label">Mobile No.</span>
            <div class="form-input">
                {{ $contract->customerApplication->mobile_1 }}
                {{ $contract->customerApplication->mobile_2 ? ", " . $contract->customerApplication->mobile_2 : "" }}
            </div>
        </div>
        <div class="form-row">
            <span class="form-label">Email Address:</span>
            <div class="form-input">
                {{ $contract->customerApplication->email_address }}
            </div>
        </div>

        <br>
        <strong>To be filled-in by BOHOL LIGHT Personnel:</strong>
        <br><br>

        <div class="two-column">
            <div class="column">
                <div class="form-row">
                    <span class="form-label">Account No.</span>
                    <div class="form-input" style="margin-right: 10px;">
                        {{ $contract->customerApplication->account_number }}
                    </div>
                    <span class="form-label">Deposit Receipt No.</span>
                    <div class="form-input">
                        {{ $contract->deposit_receipt}}
                    </div>
                </div>
                <div class="form-row">
                    <span class="form-label">Route Schedule:</span>
                    <div class="form-input" style="margin-right: 10px;">
                        {{ $contract->customerApplication->account?->route?->name }}
                    </div>
                    <span class="form-label">Rate Class:</span>
                    <div class="form-input">{{ strtoupper($contract->customerApplication->customerType->rate_class) }}</div>
                </div>
                <div class="form-row">
                    <span class="form-label">New Connection</span>
                    <div class="form-checkbox" style="margin-right: 10px; position: relative;">
                        @if ($contract->type==="New Connection")
                            <div style="position: absolute; top: 2px; left: 4px; font-size: 14px; font-weight: bold;">✓</div>
                        @endif
                    </div>
                    <span class="form-label">Change of Service</span>
                    <div class="form-checkbox" style="margin-right: 10px; position: relative;">
                        @if ($contract->type==="Change of Service")
                            <div style="position: absolute; top: 2px; left: 4px; font-size: 14px; font-weight: bold;">✓</div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <table class="load-table">
            <thead>
                <tr>
                    <th>NO. OF UNITS</th>
                    <th>DESCRIPTION OF LOAD</th>
                    <th>ESTIMATED DEMAND IN WATTS*</th>
                </tr>
            </thead>
            <tbody>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td></tr>
                <tr><td colspan="2"><strong>TOTAL</strong></td><td></td></tr>
            </tbody>
        </table>

        <p class="italic">*For estimate purposes only. Power Bills will be based on actual consumption or metered consumption of CUSTOMER.</p>
    </div>

    <div class="contract-intro">
        This <strong>CONTRACT</strong> entered into this <u>{{ \Carbon\Carbon::parse($contract->entered_date)->format('jS') }}</u>
        day of <u>{{ \Carbon\Carbon::parse($contract->entered_date)->format('F') }}
        {{ \Carbon\Carbon::parse($contract->entered_date)->format('Y') }}</u>
        between the Bohol Light Company, Inc. hereinafter referred to as "Bohol Light" or the "Company"
        and the person above stated, hereinafter referred to as the <strong>CUSTOMER</strong>.
    </div>

    {{-- <div class="page-number">1</div> --}}
    @pageBreak
    <div class="section-title">BOHOL LIGHT AGREES THAT:</div>

    <div class="clause">
        <span class="clause-number">1.</span>
        BOHOL LIGHT shall furnish electric current service to the Customer's installation at the address above during the period of this contract, at the rates stipulated and under the conditions stated in its Electric Service Rate Schedule Case in ERC Case No. 2015-089 RC, the total wattage of which shall not exceed the approved load. The Customer shall allow BOHOL LIGHT to inspect the wiring installations at the address of Customer specified herein to ensure that they comply with BOHOL LIGHT requirements, provided that the failure of BOHOL LIGHT to inspect such wiring installations shall not be deemed as an approval by BOHOL LIGHT of the conformity of such wiring installations and electrical requirements.
    </div>

    <div class="clause">
        <span class="clause-number">2.</span>
        BOHOL LIGHT shall charge and collect from customer only rates and charges that are allowed and/or approved by the Energy Regulatory Commission.
    </div>

    <div class="section-title">THE CUSTOMER AGREES THAT:</div>

    <div class="clause">
        <span class="clause-number">3.</span>
        Customer shall take electric service from BOHOL LIGHT for a period of at least three (3) months from the date of this contract and thereafter until this contract is terminated by at least forty-eight (48) hours written notice to BOHOL LIGHT, and as long as said notice has not been given to BOHOL LIGHT the Customer remains liable for all bills incurred for the electric service furnished. The Customer taking electric current service for a period of less than three (3) months shall be required to pay the amount of Fifty-six pesos and 43/100 (P56.43) including the VAT for reconnection and disconnection services. Whenever applicable, the following services shall be paid for by Customer:

        <div class="sub-clause">
            a) New Connections ................................. no charge<br>
            (for applications for standard three phase service costs shall be determined on a per case basis after analysis of load and determination of the materials, labor and equipment needed);
        </div>
        <div class="sub-clause">b) Reconnections .........................................P56.00 inclusive of VAT;</div>
        <div class="sub-clause">c) Change of meter's location on Customer's request .............................. no cost, location to be determined by BOHOL LIGHT;</div>
        <div class="sub-clause">d) Transfer of Service and meter on Customer's request ........................ same as for new connections</div>
        <div class="sub-clause">e) Testing and/or replacement of meter on customer's request ............. P256.00 for Residential and P356.00 for Commercial Consumers inclusive of VAT.</div>
        <div class="sub-clause">f) Change of type service (single phase to three phase two-wire to three wire, etc)<br>
        To be determined on a per case basis after analysis of load and determination of the materials, labor and equipment needed.</div>
    </div>

    <div class="clause">
        <span class="clause-number">4.</span>
        Customer shall purchase from BOHOL LIGHT all electric energy used on the premises specified above. Customer is prohibited from providing electricity to premises other than those covered by this electric service contract. Subject to a notice, this shall be a ground for disconnection of electric service. Any unauthorized connection to the existing electric service facilities of the Customer shall be penalized by a fine of P1,000.00 imposed against the actual user/s of every unauthorized loadside connection and P2,000.00 to be imposed against the registered Customer allowing such load side connection/s.
    </div>

    <div class="clause">
        <span class="clause-number">5.</span>
        Customer shall pay BOHOL LIGHT the total amount stated in customer's monthly power bill within nine (10) days after delivery of the said bill by BOHOL LIGHT at the above stated address of the Customer. BOHOL LIGHT shall bill customers only at the rates stipulated and allowed by the Energy Regulatory Commission and under the conditions stated in its Electric Service Rate Schedule a copy of which has been furnished the Customer. For failure of the Customer to pay the bill within the period herein fixed, a surcharge shall be collected equal to 2% of the unpaid amount of the bill for every month that the bill remains unpaid, provided that a fraction of a month shall be deemed 1 month. The word "month" as used herein is hereby defined to be the elapsed time between two successive meter readings which may be thirty (30) days, thirty-one (31) days, twenty-eight (28) or twenty-nine (29) days apart depending on the months of the billing period. In the event of the stoppage, failure, malfunction or defect of any meter to register the full amount of energy consumed, the Customer shall be billed for such a billing period in accordance with the Magna Carta for Electricity Consumers or the applicable provisions of R.A. No. 7832.
    </div>

    <div class="clause">
        <span class="clause-number">6.</span>
        Customers who chooses to pay by check shall ensure that check is sufficiently funded. In the event that any check made or drawn and issued by Customer or an "accommodation party" is subsequently dishonored by the drawee bank for insufficiency of funds or credit or would have been dishonored for the same reason had not the drawer, without any valid reason, ordered the bank to stop payment, Customer shall pay a fine equivalent to 25% of the amount of the check.
    </div>

    <div class="clause">
        <span class="clause-number">7.</span>
        Low Load Customers shall make an initial deposit with BOHOL LIGHT in the amount of P2,500.00. Residential Customers shall make an initial deposit based on the size of the service entrance wire required by such customers in accordance with the table below:
    </div>

    <strong>Residential Customers:</strong>
    <table class="deposit-table">
        <thead>
            <tr>
                <th>Service Wire Size</th>
                <th>Ampacity</th>
                <th>Bill Deposit</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Low Loads Res</td><td>50</td><td>P2,500.00</td></tr>
            <tr><td>No. 6 AWG</td><td>50</td><td>P4,000.00</td></tr>
            <tr><td>No.4. AWG</td><td>65</td><td>P5,000.00</td></tr>
            <tr><td>No.2 AWG</td><td>85</td><td>P7,000.00</td></tr>
            <tr><td>No. 2 AWG & Higher</td><td>115</td><td>P8,000.00</td></tr>
        </tbody>
    </table>

    <strong>Non-Residential Customers</strong> shall make an initial deposit with BOHOL LIGHT in accordance with the table below:

    <table class="deposit-table">
        <thead>
            <tr>
                <th>Service Wire Size</th>
                <th>Ampacity</th>
                <th>Bill Deposit</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>No. 8 AWG</td><td>50</td><td>P10,000.00</td></tr>
            <tr><td>No. 6 AWG</td><td>65</td><td>P10,000.00</td></tr>
            <tr><td>No.4. AWG</td><td>85</td><td>P40,000.00</td></tr>
            <tr><td>No.2 AWG</td><td>115</td><td>P50,000.00</td></tr>
        </tbody>
    </table>

    <p>For Customers whose kilowatt demand is estimated to reach at least 15 kilowatts based on their submitted electrical plans, their bill deposit shall be computed based on the following formula:</p>

    <div class="formula">
        <strong>Bill Deposit = (Demand x 8760 x Load Factor) / 12 x Current Rate</strong>
    </div>

    <p>Provided that, for all classes of Customers, their respective monthly bills, after 12 months, show an average billing that is more than the estimated amount based on their load or service wire size, then their respective deposit/s shall be correspondingly increased to approximate their average monthly billing. Such deposit shall guarantee the prompt payment of Customer's bills or of his lessee or occupants. In case of delay or failure of payment, BOHOL LIGHT reserves the right to apply the said deposit or so much thereof to the balance of account without prejudice to other legal remedies which BOHOL LIGHT may have against the Customer for the collection of the delinquency. In case BOHOL LIGHT is constrained to utilize the deposit of a Customer, such customer shall immediately replenish its deposit as a condition to continued electric service by BOHOL LIGHT.</p>

    <div class="clause">
        <span class="clause-number">8.</span>
        BOHOL LIGHT reserves the right to disconnect its services for any of the following causes: (a) for repairs; (b) for want of supply, (c) for cancellation of right-of-way of BOHOL LIGHT's lines serving Customer; (d) for non-payment of bills when due and proper warning has been given including the failure to pay the adjusted bill in those cases where the meter stopped or failed to register the amount of energy consumed; (e) for non-payment of damages to BOHOL LIGHT's properties for which Customer is liable; (f) for fraudulent use of current; (g) for violation of any condition of this contract or of any of the terms and conditions of the standard rules and regulations of the Energy Regulatory Commission by the Customer; (h) should any information or document presented or submitted by the Customer to BOHOL LIGHT Power in connection with the Customer's electric service application be found to be fraudulent, inaccurate, false, fake or forged; (i) should the Customer fail to submit or comply with any requirement for service application within one hundred (120) days from the date of energization or whenever requested or required by BOHOL LIGHT Power; (j) should the Customer or any of its personnel/agent commit any of the unlawful acts enumerated in Section 4(a) of R.A. 7832 otherwise known as the "Anti-Pilferage Act of 1994" and its implementing Rules and Regulations; and (k) should the electrical installations and connections in the premises of the Customer be found unsafe or not up to the relevant standards as determined by the competent governmental authorities.
    </div>

    <div class="clause">
        <span class="clause-number">9.</span>
        Such disconnection, however, shall be without prejudice to other legal remedies which the Company may have against the Customer, and no delay by the Company in enforcing any of its rights shall be deemed a waiver or such rights, nor shall a waiver by the Company of the Customer's default be deemed a waiver of any other or subsequent defaults. In the case of arrears in the payment of bills on non-payment of the adjusted bills, the Company may discontinue the service notwithstanding the existence of the Customer's deposit with the Company which will serve as guarantee for the payment of future bills after service is reconnected upon payment by the customer of his obligations with the Company.
    </div>

    <div class="clause">
        <span class="clause-number">10.</span>
        Customers who causes the unauthorized reconnection of electric services after the same are disconnected by BOHOL LIGHT due to unpaid bills shall pay a fine of P1,000.00.
    </div>

    <div class="clause">
        <span class="clause-number">11.</span>
        BOHOL LIGHT shall have the right to pull out the watt-hour meter of the Customer for non-payment of bills, upgrading, calibration and for violation of Republic Act No. 7832.
    </div>

    {{-- <div class="page-number">2</div> --}}

    <div class="clause">
        <span class="clause-number">12.</span>
        BOHOL LIGHT shall not be liable for any damages to the Customer for failure to supply electricity under any conditions. BOHOL LIGHT shall not be liable to the Customer for any loss, injury or damage resulting from the Customer's use of his equipment or from the connections of the Company's wires with BOHOL LIGHT's wires and appliances.
    </div>

    <div class="clause">
        <span class="clause-number">13.</span>
        Customer shall be held responsible for tampering, interfering with or breaking of seals of meters or other equipment of BOHOL LIGHT installed on the Customer's premises, or in special case where the Customer accepts responsibility in writing, and shall be held liable for same in accordance with law. Devices used herein shall be confiscated. The Customer agrees that no one except employees of BOHOL LIGHT showing proper identification card shall be allowed to make any external adjustments of any meter or any other piece of apparatus owned and belonging to the Company.
    </div>

    <div class="clause">
        <span class="clause-number">14.</span>
        For commercial buildings, residential buildings or lots leased and or occupied by other people both the owner of the building and the occupant thereof shall be signatories to this contract and shall be jointly and severally liable for the power bills and for damages in case of breach thereof.
    </div>

    <div class="clause">
        <span class="clause-number">15.</span>
        Customer shall pay the Company in case of breach of this Contract or government rules, aside from the principal and surcharges, an amount equivalent to twenty-five percent (25%) of the total amount due as attorney's fees, aside from costs, whenever the account is handed to an attorney for collection or enforcement.
    </div>

    <div class="clause">
        <span class="clause-number">16.</span>
        Both BOHOL LIGHT and the Customer shall abide by all the terms and conditions specified in this Contract and any contract or agreement made before this date by any employee or agent of the Company shall be deemed repealed, cancelled or superseded by this Contract and shall not be binding on both parties.
    </div>

    <div class="clause">
        <span class="clause-number">17.</span>
        Failure on the part of the Customer to comply with the provisions of this Contract and of the rules and regulations for electric service promulgated by BOHOL LIGHT will mean disconnection of his/her electric service.
    </div>

    <div class="clause">
        <span class="clause-number">18.</span>
        Customer hereby requests and consents to have his/her/its watt-hour meter mounted on the nearest pole and hereby assumes responsibility for the integrity of its connection and well-being of the instrument and its seals.
    </div>

    <div class="clause">
        <span class="clause-number">19.</span>
        The Customer hereby explicitly and unambiguously consents to the collection, use and transfer, in electronic or other form, by BOHOL LIGHT Power of his/her Personal Information as defined under RA 10173 otherwise known as the "Data Privacy Act of 2012" for all purposes necessary and related to the fulfillment of this contract.
    </div>

    <div class="clause">
        <span class="clause-number">20.</span>
        The Customer likewise authorizes BOHOL LIGHT Power to subcontract the processing of Customer's Personal Information: Provided, That BOHOL LIGHT Power shall be responsible for ensuring that proper safeguards are in place to ensure the confidentiality of the Personal Information processed, prevent its use for unauthorized purposes, and comply with the requirements of RA 10173 and other laws for processing of Personal Information.
        <br><br>
        In recognition of the foregoing, BOHOL LIGHT Power agrees and covenants that it shall:
        <div class="sub-clause">
            (i) keep and maintain all Personal Information in strict confidence, using such a degree of care as is appropriate to avoid unauthorized access, use or disclosure;
        </div>
        <div class="sub-clause">
            (ii) use and disclose Personal Information solely and exclusively for the purposes for which the Personal Information, or access to it, is provided pursuant to the terms and conditions of this contract, and not use, sell, rent, transfer, distribute, or otherwise disclose or make available Personal Information for BOHOL LIGHT Power's own purposes or for the benefit of anyone other than Customer, in each case, without Customer's prior written consent; and
        </div>
        <div class="sub-clause">
            (iii) not, directly or indirectly, disclose Personal Information to any person other than its Authorized Employees/Authorized Persons, including any, subcontractors, agents, outsourcers or auditors, without express written consent from Customer unless and to the extent required by Government Authorities or as otherwise, to the extent expressly required, by applicable law.
        </div>
    </div>

    <div class="clause">
        <span class="clause-number">21.</span>
        Customer acknowledges that he/she has read the foregoing contract and has fully understood its contents and has signed the said contract and agreed to its terms freely and unconditionally.
    </div>

    <div class="clause">
        <span class="clause-number">22.</span>
        The meters, wires, materials and appliances installed at BOHOL LIGHT's expense at Customer's premises belong to and remain the properties of BOHOL LIGHT and may be replaced and or their installation moved by BOHOL LIGHT at any time.
    </div>

    <div class="clause">
        <span class="clause-number">23.</span>
        Customer shall maintain the electric installation from the meter to the Customer's premises at the above stipulated address in proper condition during the period of its connection with the lines of BOHOL LIGHT. Customer shall make no additions or changes in the installation that may affect the total demand contracted as indicated in paragraph 1 hereof without the knowledge and consent of BOHOL LIGHT, particularly where such additions or changes may affect the rate schedule classification or cause the meter of BOHOL LIGHT to be overloaded or otherwise damaged. In case of such unauthorized addition, change, overloading, grounding negligence and other causes within the control of the Customer, the latter shall be liable for such damages caused to the meter of BOHOL LIGHT as well as other properties installed in the premises and used in carrying out this Contract and
    </div>

    {{-- <div class="page-number">3</div> --}}

    <p>shall entitle the BOHOL LIGHT to confiscate the bulbs, wires and other materials used in the violation. BOHOL LIGHT shall be entitled to collect from the Customer unbilled income which otherwise would have been earned and collected if not for said unauthorized acts.</p>

    <div class="clause">
        <span class="clause-number">24.</span>
        Customer warrants that the electrical installations in the premises subject of this service application have been installed in accordance with the applicable safety standards and shall be kept and maintained in good condition for the duration of Customer's connection with BOHOL LIGHT Power. Customer shall hold BOHOL LIGHT Power free and harmless from any damages or liabilities due to any defect or fault in the electrical installations in the premises subject of this service application.
    </div>

    <div class="clause">
        <span class="clause-number">25.</span>
        The employees and/or representatives of BOHOL LIGHT are hereby given permission by the Customer to enter his premises, without being liable to trespass to dwelling, for the sole purpose of inspecting, installing, reading, removing, testing, replacing, or otherwise disposing of its apparatus and property, and/or removing the entire property of BOHOL LIGHT in the event of the termination of this Contract for any cause.
    </div>

    <p style="margin-top: 30px;">Done at Tagbilaran City, Philippines on the date above written.</p>

    <div class="signature-section">
        <div class="signature-block">
            <strong>BOHOL LIGHT COMPANY, INC.</strong>
            <div style="margin-top: 40px"><strong>ENGR. RAUL VENERANDO M. GALANO</strong></div>
            <div class="signature-line"></div>
            Chief Operating Officer
        </div>
        <div class="signature-block">
            <strong>CUSTOMER</strong>
            <div style="margin-top: 40px; text-transform: uppercase; position: relative">
                <img src="{{$contract->signature_data}}" alt="Customer Signature" style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); max-height: 80px; z-index: -1;">
                <strong>{{$contract->customerApplication->full_name}}</strong>
            </div>
            <div class="signature-line"></div>
            (Customer Signature over printed name)<br><br>
            <div style="text-align: left">
                <div style="width: 70px; display: inline-block;">
                    I.D. No.
                </div>
                <div style="width: 120px; border-bottom: 1px solid #222; display: inline-block; text-align:center">{{$contract->id_no_1}}</div><br>

                <div style="width: 70px; display: inline-block;">Issued by</div>
                <div style="width: 120px; border-bottom: 1px solid #222; display: inline-block; text-align:center">{{$contract->issued_by_1}}</div><br>

                <div style="width: 70px; display: inline-block;">Valid until</div>
                <div style="width: 120px; border-bottom: 1px solid #222; display: inline-block; text-align:center">{{$contract?->valid_until_1?->format('F d, Y')}}</div>
            </div>
        </div>
    </div>

    <div style="margin-top: 40px; text-align: left;">
        <strong>I AGREE TO BE THE SURETY OF THE CUSTOMER:</strong>
        <div style="margin-top: 30px; position: relative; width: 50%;">
            <div class="signature-line" style="border-bottom: 1px solid #000; width: 100%; text-align:center; text-transform: uppercase">
                <strong>{{ $contract->building_owner }}</strong>
            </div>
            <div style="text-align: center; width: 100%;">Owner of the Building/Lessor</div>
        </div><br>
        <div style="text-align: left">
            <div style="width: 70px; display: inline-block;">
                I.D. No.
            </div>
            <div style="width: 120px; border-bottom: 1px solid #222; display: inline-block; text-align:center">{{$contract->id_no_2}}</div><br>

            <div style="width: 70px; display: inline-block;">Issued by</div>
            <div style="width: 120px; border-bottom: 1px solid #222; display: inline-block; text-align:center">{{$contract->issued_by_2}}</div><br>

            <div style="width: 70px; display: inline-block;">Valid until</div>
            <div style="width: 120px; border-bottom: 1px solid #222; display: inline-block; text-align:center">{{$contract->valid_until_2?->format('F d, Y')}}</div>
        </div>
    </div>

    <p class="italic" style="margin-top: 30px;">
        * Applicants/customers who cannot present proof of legal right to occupy the premises/address being applied for must submit a certification of actual occupancy issued by the Barangay where the address/premises applied for is located. Such applicants/customers must also execute the attached waiver in favor of BOHOL LIGHT Power
    </p>

    {{-- <div class="page-number">4</div> --}}

    @pageBreak
    <div class="acknowledgment">
        <div style="text-align: left; margin-bottom: 20px;">
            <strong>Republic of the Philippines)<br>
            CITY OF TAGBILARAN )<br>
            S.S.</strong>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
            <strong>ACKNOWLEDGMENT</strong>
        </div>

        <p>
            <strong>BEFORE ME,</strong> a Notary Public, for and in the City of Tagbilaran, Philippines, this _________ personally appeared _________________ with ID No. _________ issued by _________ on _________, and _________________ with ID No. _________ issued by _________ on _________, known to me and to me known to be the same persons who executed the foregoing instrument, or identified through competent evidence of identity as defined by the 2004 Rules on Notarial Practice, and they acknowledged to me that the same is their free and voluntary act and deed.
        </p>

        <p>
            This Contract for Electric Service consists of six (6) pages including the page on which this Acknowledgment is written.
        </p>

        <p>
            <strong>WITNESS MY HAND AND NOTARIAL SEAL</strong> on the date and place above written.
        </p>

        <div style="margin-top: 30px;">
            <div class="signature-line" style="width: 50%;"></div>
        </div>

        <div style="margin-top: 30px;">
            Doc. No. ________; <br>
            Page No. ________; <br>
            Book No. ________; <br>
            Series of 20____.
        </div>
    </div>

    {{-- <div class="page-number">5</div> --}}
</body>
</html>
