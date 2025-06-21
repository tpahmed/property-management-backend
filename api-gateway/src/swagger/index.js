/**
 * @swagger
 * tags:
 *   - name: System
 *     description: System information and architecture
 * 
 * /health:
 *   get:
 *     summary: API Gateway health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API Gateway is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 * 
 * /services/health:
 *   get:
 *     summary: Check health of all microservices
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Status of all services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: object
 *                   properties:
 *                     auth-service:
 *                       type: string
 *                       enum: [up, down]
 *                     property-service:
 *                       type: string
 *                       enum: [up, down]
 *                     maintenance-service:
 *                       type: string
 *                       enum: [up, down]
 *                     payment-service:
 *                       type: string
 *                       enum: [up, down]
 */ 