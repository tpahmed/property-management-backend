/**
 * @swagger
 * tags:
 *   - name: Properties
 *     description: Property management operations
 *   - name: Rental Applications
 *     description: Rental application operations
 *   - name: Leases
 *     description: Lease management operations
 * 
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - address
 *         - propertyType
 *         - bedrooms
 *         - bathrooms
 *         - squareFeet
 *         - rentAmount
 *         - securityDeposit
 *         - availableDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the property
 *         title:
 *           type: string
 *           description: Property title
 *         description:
 *           type: string
 *           description: Property description
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *               default: USA
 *         propertyType:
 *           type: string
 *           enum: [apartment, house, condo, townhouse, commercial]
 *         bedrooms:
 *           type: number
 *           minimum: 0
 *         bathrooms:
 *           type: number
 *           minimum: 0
 *         squareFeet:
 *           type: number
 *           minimum: 0
 *         rentAmount:
 *           type: number
 *           minimum: 0
 *         securityDeposit:
 *           type: number
 *           minimum: 0
 *         availableDate:
 *           type: string
 *           format: date
 *         isAvailable:
 *           type: boolean
 *           default: true
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               caption:
 *                 type: string
 *         ownerId:
 *           type: string
 *         managerId:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     RentalApplication:
 *       type: object
 *       required:
 *         - propertyId
 *         - tenantId
 *         - moveInDate
 *         - leaseTerm
 *         - employmentInfo
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the application
 *         propertyId:
 *           type: string
 *           description: Property ID
 *         tenantId:
 *           type: string
 *           description: Tenant ID
 *         moveInDate:
 *           type: string
 *           format: date
 *         leaseTerm:
 *           type: number
 *           description: Lease term in months
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, canceled]
 *           default: pending
 *         employmentInfo:
 *           type: object
 *           properties:
 *             employer:
 *               type: string
 *             position:
 *               type: string
 *             monthlyIncome:
 *               type: number
 *             employmentLength:
 *               type: number
 *               description: Employment length in months
 *         creditScore:
 *           type: number
 *           minimum: 300
 *           maximum: 850
 *         previousRentals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               landlordName:
 *                 type: string
 *               landlordContact:
 *                 type: string
 *               rentalDuration:
 *                 type: number
 *                 description: Duration in months
 *         references:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relationship:
 *                 type: string
 *               contact:
 *                 type: string
 *         additionalNotes:
 *           type: string
 *         reviewedBy:
 *           type: string
 *           nullable: true
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         rejectionReason:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Lease:
 *       type: object
 *       required:
 *         - propertyId
 *         - tenantId
 *         - ownerId
 *         - startDate
 *         - endDate
 *         - rentAmount
 *         - securityDeposit
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the lease
 *         propertyId:
 *           type: string
 *         tenantId:
 *           type: string
 *         ownerId:
 *           type: string
 *         managerId:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         rentAmount:
 *           type: number
 *           minimum: 0
 *         securityDeposit:
 *           type: number
 *           minimum: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *         paymentDueDay:
 *           type: number
 *           minimum: 1
 *           maximum: 31
 *           default: 1
 *         lateFeesApplicable:
 *           type: boolean
 *           default: true
 *         lateFeeAmount:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         lateFeeApplicableAfterDays:
 *           type: number
 *           minimum: 0
 *           default: 5
 *         renewalOffered:
 *           type: boolean
 *           default: false
 *         renewalDetails:
 *           type: object
 *           nullable: true
 *           properties:
 *             offeredAt:
 *               type: string
 *               format: date-time
 *             newRentAmount:
 *               type: number
 *               minimum: 0
 *             newTermLength:
 *               type: number
 *               minimum: 1
 *             status:
 *               type: string
 *               enum: [pending, accepted, rejected, expired]
 *             responseDate:
 *               type: string
 *               format: date-time
 *         terminationRequested:
 *           type: boolean
 *           default: false
 *         terminationDetails:
 *           type: object
 *           nullable: true
 *           properties:
 *             requestedBy:
 *               type: string
 *               enum: [tenant, owner, manager]
 *             requestDate:
 *               type: string
 *               format: date-time
 *             reason:
 *               type: string
 *             approvedBy:
 *               type: string
 *             approvedDate:
 *               type: string
 *               format: date-time
 *             moveOutDate:
 *               type: string
 *               format: date
 *         documents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *         specialTerms:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with optional filtering
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [apartment, house, condo, townhouse, commercial]
 *         description: Property type
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         description: Number of bedrooms
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Availability status
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 property:
 *                   $ref: '#/components/schemas/Property'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only property owners can create properties
 */

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 property:
 *                   $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *   put:
 *     summary: Update property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: object
 *               propertyType:
 *                 type: string
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               squareFeet:
 *                 type: number
 *               rentAmount:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *               availableDate:
 *                 type: string
 *                 format: date
 *               isAvailable:
 *                 type: boolean
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 property:
 *                   $ref: '#/components/schemas/Property'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to update this property
 *       404:
 *         description: Property not found
 *   delete:
 *     summary: Delete property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only the property owner can delete this property
 *       404:
 *         description: Property not found
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Submit a rental application
 *     tags: [Rental Applications]
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
 *               - moveInDate
 *               - leaseTerm
 *               - employmentInfo
 *             properties:
 *               propertyId:
 *                 type: string
 *               moveInDate:
 *                 type: string
 *                 format: date
 *               leaseTerm:
 *                 type: number
 *               employmentInfo:
 *                 type: object
 *                 required:
 *                   - employer
 *                   - position
 *                   - monthlyIncome
 *                   - employmentLength
 *                 properties:
 *                   employer:
 *                     type: string
 *                   position:
 *                     type: string
 *                   monthlyIncome:
 *                     type: number
 *                   employmentLength:
 *                     type: number
 *               creditScore:
 *                 type: number
 *               previousRentals:
 *                 type: array
 *                 items:
 *                   type: object
 *               references:
 *                 type: array
 *                 items:
 *                   type: object
 *               additionalNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   $ref: '#/components/schemas/RentalApplication'
 *       400:
 *         description: Invalid input or property not available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only tenants can submit applications
 *       404:
 *         description: Property not found
 */

/**
 * @swagger
 * /api/applications/property/{propertyId}:
 *   get:
 *     summary: Get applications by property
 *     tags: [Rental Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of applications for the property
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RentalApplication'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to view applications for this property
 *       404:
 *         description: Property not found
 */

/**
 * @swagger
 * /api/applications/review:
 *   put:
 *     summary: Review rental application (approve or reject)
 *     tags: [Rental Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - status
 *             properties:
 *               applicationId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   $ref: '#/components/schemas/RentalApplication'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to review this application
 *       404:
 *         description: Application or property not found
 */

/**
 * @swagger
 * /api/leases:
 *   post:
 *     summary: Create a new lease
 *     tags: [Leases]
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
 *               - tenantId
 *               - startDate
 *               - endDate
 *               - rentAmount
 *               - securityDeposit
 *             properties:
 *               propertyId:
 *                 type: string
 *               tenantId:
 *                 type: string
 *               applicationId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               rentAmount:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *               paymentDueDay:
 *                 type: number
 *                 default: 1
 *               lateFeesApplicable:
 *                 type: boolean
 *               lateFeeAmount:
 *                 type: number
 *               lateFeeApplicableAfterDays:
 *                 type: number
 *               specialTerms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lease created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lease:
 *                   $ref: '#/components/schemas/Lease'
 *       400:
 *         description: Invalid input or property already has an active lease
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to create a lease for this property
 *       404:
 *         description: Property or application not found
 */

/**
 * @swagger
 * /api/leases/terminate:
 *   post:
 *     summary: Request lease termination
 *     tags: [Leases]
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
 *               - reason
 *             properties:
 *               leaseId:
 *                 type: string
 *               reason:
 *                 type: string
 *               moveOutDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Lease termination request processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lease:
 *                   $ref: '#/components/schemas/Lease'
 *       400:
 *         description: Invalid input or lease is already inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized to terminate this lease
 *       404:
 *         description: Lease not found
 */ 