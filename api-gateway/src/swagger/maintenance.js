/**
 * @swagger
 * tags:
 *   - name: Maintenance
 *     description: Maintenance request operations
 * 
 * components:
 *   schemas:
 *     MaintenanceRequest:
 *       type: object
 *       required:
 *         - propertyId
 *         - tenantId
 *         - title
 *         - description
 *         - category
 *         - priority
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the maintenance request
 *         propertyId:
 *           type: string
 *           description: Property ID
 *         tenantId:
 *           type: string
 *           description: Tenant ID
 *         title:
 *           type: string
 *           description: Title of the maintenance request
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *         category:
 *           type: string
 *           enum: [plumbing, electrical, appliance, heating_cooling, structural, pest_control, other]
 *           description: Category of the maintenance issue
 *         priority:
 *           type: string
 *           enum: [low, medium, high, emergency]
 *           default: medium
 *           description: Priority level of the request
 *         status:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, canceled]
 *           default: pending
 *           description: Current status of the request
 *         preferredAvailability:
 *           type: string
 *           description: Tenant's preferred time for maintenance visit
 *         permissionToEnter:
 *           type: boolean
 *           default: false
 *           description: Whether maintenance staff has permission to enter when tenant is not present
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               caption:
 *                 type: string
 *         assignedTo:
 *           type: string
 *           nullable: true
 *           description: ID of maintenance staff or contractor assigned to the request
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         notes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               addedBy:
 *                 type: string
 *               addedAt:
 *                 type: string
 *                 format: date-time
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *         cost:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               default: 0
 *             currency:
 *               type: string
 *               default: USD
 *             details:
 *               type: string
 *         rating:
 *           type: object
 *           properties:
 *             score:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             comment:
 *               type: string
 *             ratedAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Create a new maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - title
 *               - description
 *               - category
 *             properties:
 *               propertyId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [plumbing, electrical, appliance, heating_cooling, structural, pest_control, other]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, emergency]
 *                 default: medium
 *               preferredAvailability:
 *                 type: string
 *               permissionToEnter:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     caption:
 *                       type: string
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only tenants can create maintenance requests
 *
 *   get:
 *     summary: Get all maintenance requests (filtered by user role)
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, canceled]
 *         description: Filter by status
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by property ID
 *     responses:
 *       200:
 *         description: List of maintenance requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MaintenanceRequest'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/maintenance/{id}:
 *   get:
 *     summary: Get maintenance request by ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Maintenance request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this request
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/maintenance/status:
 *   put:
 *     summary: Update maintenance request status
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - status
 *             properties:
 *               requestId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, assigned, in_progress, completed, canceled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to update this request
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/maintenance/assign:
 *   put:
 *     summary: Assign maintenance request to staff
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - assignedTo
 *             properties:
 *               requestId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Request assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only property managers and owners can assign requests
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/maintenance/note:
 *   post:
 *     summary: Add note to maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - text
 *             properties:
 *               requestId:
 *                 type: string
 *               text:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Note added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/maintenance/rate:
 *   post:
 *     summary: Rate completed maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - score
 *             properties:
 *               requestId:
 *                 type: string
 *               score:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Invalid input or request not completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only tenants can rate maintenance requests
 *       404:
 *         description: Request not found
 */ 