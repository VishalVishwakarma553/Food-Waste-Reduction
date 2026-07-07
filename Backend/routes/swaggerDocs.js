/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: [consumer, restaurant, ngo]
 *           example: "consumer"
 *         businessName:
 *           type: string
 *           nullable: true
 *           example: "Tasty Bites"
 *         cuisineType:
 *           type: string
 *           nullable: true
 *           example: "Italian"
 *         businessImage:
 *           type: string
 *           nullable: true
 *           example: "uploads/business-123.jpg"
 *         ngoRegNumber:
 *           type: string
 *           nullable: true
 *           example: "NGO-998877"
 *         contactPerson:
 *           type: string
 *           nullable: true
 *           example: "Jane Smith"
 *         serviceRadius:
 *           type: number
 *           example: 15
 *         address:
 *           type: string
 *           example: "123 Main St"
 *         city:
 *           type: string
 *           example: "New York"
 *         state:
 *           type: string
 *           example: "NY"
 *         pincode:
 *           type: string
 *           example: "10001"
 *         latitude:
 *           type: number
 *           example: 40.7128
 *         longitude:
 *           type: number
 *           example: -74.0060
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "uploads/avatar-123.jpg"
 *         bio:
 *           type: string
 *           nullable: true
 *           example: "Passionate about reducing food waste."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-07T12:00:00Z"
 *
 *     FoodListing:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         restaurantId:
 *           type: integer
 *           example: 3
 *         name:
 *           type: string
 *           example: "Surplus Margherita Pizza"
 *         category:
 *           type: string
 *           example: "Meals"
 *         subCategory:
 *           type: string
 *           example: "Pizza"
 *         description:
 *           type: string
 *           example: "Freshly made pizzas that were not picked up."
 *         tags:
 *           type: string
 *           example: "vegetarian, fresh"
 *         images:
 *           type: string
 *           example: '["uploads/pizza1.jpg"]'
 *         city:
 *           type: string
 *           example: "New York"
 *         quantity:
 *           type: number
 *           example: 5
 *         unit:
 *           type: string
 *           example: "kg"
 *         originalPrice:
 *           type: number
 *           example: 15.00
 *         discountedPrice:
 *           type: number
 *           example: 5.00
 *         minOrder:
 *           type: number
 *           example: 1
 *         expiryDate:
 *           type: string
 *           example: "2026-07-08"
 *         expiryTime:
 *           type: string
 *           example: "22:00"
 *         status:
 *           type: string
 *           enum: [active, draft, expired]
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 45
 *         consumerId:
 *           type: integer
 *           example: 2
 *         notes:
 *           type: string
 *           example: "Please call on arrival"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, ready, completed, cancelled]
 *           example: "pending"
 *         foodSaved:
 *           type: number
 *           example: 2.5
 *         co2Saved:
 *           type: number
 *           example: 6.25
 *         createdAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderId:
 *           type: integer
 *         listingId:
 *           type: integer
 *         quantity:
 *           type: number
 *         pickupSlot:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *         restaurantName:
 *           type: string
 *
 *     Beneficiary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         ngoId:
 *           type: integer
 *         name:
 *           type: string
 *           example: "Hope Shelter"
 *         type:
 *           type: string
 *           example: "Shelter"
 *         location:
 *           type: string
 *           example: "Brooklyn"
 *         size:
 *           type: integer
 *           example: 50
 *         contactPhone:
 *           type: string
 *           example: "555-0199"
 *         notes:
 *           type: string
 *           example: "Serve dinner daily"
 *         mealsReceived:
 *           type: integer
 *           example: 120
 *         lastServed:
 *           type: string
 *           example: "2026-07-06"
 *
 *     Distribution:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         ngoId:
 *           type: integer
 *         beneficiaryId:
 *           type: integer
 *         orderId:
 *           type: integer
 *           nullable: true
 *         foodItems:
 *           type: string
 *           example: "Pizza and Salad"
 *         quantity:
 *           type: number
 *           example: 10
 *         unit:
 *           type: string
 *           example: "kg"
 *         distributedAt:
 *           type: string
 *           format: date-time
 *
 *     ResponseError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Unauthorized"
 */

export default {};
