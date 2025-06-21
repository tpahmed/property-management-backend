/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment operations
 * 
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - leaseId
 *         - propertyId
 *         - tenantId
 *         - ownerId
 *         - amount
 *         - paymentMethod
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the payment
 *         leaseId:
 *           type: string
 *           description: Lease ID
 *         propertyId:
 *           type: string
 *           description: Property ID
 *         tenantId:
 *           type: string
 *           description: Tenant ID
 *         ownerId:
 *           type: string
 *           description: Property owner ID
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Payment amount
 *         paymentType:
 *           type: string
 *           enum: [rent, security_deposit, late_fee, maintenance, other]
 *           default: rent
 *           description: Type of payment
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, bank_transfer, cash, check, other]
 *           description: Method of payment
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           default: pending
 *           description: Current status of the payment
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for rent payments
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Date when payment was made
 *         description:
 *           type: string
 *           description: Payment description
 *         transactionId:
 *           type: string
 *           description: External transaction ID
 *         receiptUrl:
 *           type: string
 *           description: URL to payment receipt
 *         notes:
 *           type: string
 *           description: Additional notes
 *         isLateFee:
 *           type: boolean
 *           default: false
 *           description: Whether this payment is a late fee
 *         period:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *               description: Start date of the period this payment covers
 *             endDate:
 *               type: string
 *               format: date-time
 *               description: End date of the period this payment covers
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaseId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               leaseId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               paymentType:
 *                 type: string
 *                 enum: [rent, security_deposit, late_fee, maintenance, other]
 *                 default: rent
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, bank_transfer, cash, check, other]
 *               description:
 *                 type: string
 *               period:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all payments (filtered by user role)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: leaseId
 *         schema:
 *           type: string
 *         description: Filter by lease ID
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by property ID
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this payment
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Process a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input or payment already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to process this payment
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /api/payments/{id}/receipt:
 *   get:
 *     summary: Generate payment receipt
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Receipt generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 receiptUrl:
 *                   type: string
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to access this receipt
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /api/payments/history/{leaseId}:
 *   get:
 *     summary: Get payment history for a lease
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     responses:
 *       200:
 *         description: Payment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this lease's payment history
 *       404:
 *         description: Lease not found
 */ 