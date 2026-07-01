# FoodSave — Surplus Food Rescue & Community Distribution Platform

FoodSave is a modern, responsive web application designed to combat food waste and address hunger in India by establishing a real-time, zero-waste supply chain between **Restaurants & Food Vendors**, **Eco-conscious Consumers**, and **Non-Governmental Organizations (NGOs)**.

---

## 🍽️ The Problem & The Solution

- **The Problem:** Roughly 40% of food produced in India is wasted annually (equivalent to ~68 million tonnes), valued at over ₹92,000 Crores, while nearly 20% of the population remains food insecure.
- **The Solution:** **FoodSave** offers a digital marketplace where food establishments can post surplus, high-quality unsold food at deep discounts or for free. Consumers get access to affordable food while reducing waste, and verified NGOs can claim bulk donations to feed local shelters and communities.

---

## 🌟 Key Features by User Role

### 1. 📱 Consumers
- **Personalized Impact Dashboard:** View real-time personal metrics including total food rescued (kg), money saved (₹), carbon footprint (CO₂ saved) reduction, and earn gamified badges.
- **Responsive Listings Browser:** Filter local surplus listings by category (e.g. Bakery, Prepared Meals, Fresh Produce, Dairy), dietary preferences (Veg, Vegan, Gluten-Free), distance, price, and logistics.
- **Claim & Checkout Cart:** Save items, select pickup time slots, and claim meals for free.
- **Favorites & Notification Panel:** Heart local restaurants to get real-time email/SMS notifications when fresh surplus listings are published.

### 2. 🏪 Restaurants
- **Listing Management:** Publish surplus food items with details, image attachments, original vs. discounted prices, expiration timers, and customizable pickup slots.
- **Performance Analytics:** View business statistics (total meals rescued, avg rating, and community impact) alongside interactive weekly and monthly charts.
- **Order Management:** Track pending, ready for pickup, and completed orders with one-click status transitions.
- **Business Profile:** Manage logo uploads, operating hours, geolocation, and settings.

### 3. 🏛️ NGOs
- **Donation Claim Feed:** Browse available free bulk donations from verified local food donors.
- **Document Verification:** Upload 12A/80G documents and deeds to receive verified charity status.
- **Interactive Pickup Schedule:** Coordinate and log collection routes with a visual, responsive **Monthly Calendar** and route sequence list.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) (Fast Hot Module Replacement)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Modern CSS framework for utilities and layouts)
- **Routing:** [React Router DOM v7](https://reactrouter.com/) (Single Page App navigation)
- **State & Data Fetching:** [Axios](https://axios-http.com/) (Centralized API client with auth interceptors)
- **Charts:** [Recharts](https://recharts.org/) (Responsive analytics rendering)
- **Icons & Alerts:** [React Icons](https://react-icons.github.io/react-icons/) & [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) (RESTful API Server)
- **Database ORM:** [Prisma ORM](https://www.prisma.io/) (PostgreSQL client generation)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Enterprise-ready relational database)
- **Authentication:** JWT (JSON Web Tokens) & Password hashing via `bcryptjs`
- **File Uploads:** `multer` (Handling image upload attachments locally)

---

## 📂 Project Structure

```bash
Food-Waste-Reduction/
├── Backend/
│   ├── prisma/             # Schema definition & SQL migrations
│   ├── uploads/            # Local directory for user/business image uploads
│   ├── server.js           # Server initialization & entrypoint
│   └── package.json        # Express dependencies and scripts
└── Frontend/
    ├── src/
    │   ├── components/     # Reusable layout and card components
    │   ├── context/        # Global authentication and shopping cart providers
    │   ├── lib/            # Axios API config (api.js)
    │   ├── pages/          # Consumer, NGO, Restaurant, and Public pages
    │   ├── index.css       # Core design system and mobile style overrides
    │   └── main.jsx        # Frontend entry point
    ├── package.json        # Vite dev dependencies and scripts
    └── vercel.json         # SPA router redirects for production deployment
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- PostgreSQL database instance running locally or hosted

### 1. Database Setup
Ensure you have a PostgreSQL database created. For example, named `FoodSave`.

### 2. Configure Backend Env
Navigate to the `Backend` directory and create/edit the `.env` file:
```bash
cd Backend
```
Add the following environment variables:
```env
PORT=8080
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/FoodSave"
JWT_SECRET="your_secure_random_jwt_secret_phrase"
FRONTEND_URL="http://localhost:5173"
```

### 3. Initialize Database & Generate Prisma Client
Install dependencies, generate the schema client, and run migrations:
```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Backend Server
Run the backend in development mode with Nodemon:
```bash
npm run dev
```
The server will run on `http://localhost:8080`.

### 5. Frontend Setup
Navigate to the `Frontend` directory:
```bash
cd ../Frontend
npm install
```

Configure the central API connection inside [src/lib/api.js](Frontend/src/lib/api.js):
```javascript
export const BASE_URL = 'http://localhost:8080/api'; // Swap with production Render/Vercel URLs in production
export const IMG_BASE_URL = 'http://localhost:8080';
```

### 6. Run the Frontend Client
```bash
npm run dev
```
The React client will spin up on `http://localhost:5173`.

---

## 🌍 Production Deployments

- **Frontend (Vite/React):** Deployed on Vercel. Router fallback rewrites are configured inside `vercel.json` to handle history-mode URL redirects correctly.
- **Backend (Node/Express):** Deployed on Render with a  Neon(PostgreSQL) instance. Ensure environment variables are loaded via the service settings dashboard.
