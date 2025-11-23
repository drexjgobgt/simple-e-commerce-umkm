# 🏪 Toko Gas UMKM - E-commerce Platform

A comprehensive e-commerce platform for gas cylinder distribution and related products, built for Indonesian UMKM (Micro, Small, and Medium Enterprises). This platform enables vendors to manage their products, process payments, and handle orders efficiently.

## ✨ Features

### 🛒 Customer Features

- **Product Browsing**: Browse gas cylinders and related products by category
- **User Authentication**: Secure login and registration system
- **Shopping Cart**: Add products to cart and manage quantities
- **Order History**: View complete order history with customer ID tracking
- **Multiple Payment Methods**: Support for Transfer Bank, COD, and E-Wallet
- **Guest Checkout**: Optional guest checkout for unregistered users

### 👨‍💼 Vendor/Admin Features

- **Product Management**: Add, edit, and delete products with image upload
- **Order Management**: View and update order statuses
- **Payment Configuration**: Individual Midtrans payment setup per vendor
- **Vendor Dashboard**: Separate dashboards for different vendors
- **Image Upload**: Cloudinary integration for product images
- **Split Payment System**: Automatic payment distribution to vendors

### 💳 Payment Integration

- **Midtrans Integration**: Secure payment processing
- **Per-Vendor Configuration**: Each vendor can set up their own payment keys
- **Multiple Payment Methods**: Bank transfer, COD, and digital wallets
- **Payment Status Tracking**: Real-time payment status updates

### 🖼️ Media Management

- **Cloudinary Integration**: Reliable image hosting and optimization
- **Image Upload**: Drag-and-drop image upload in admin dashboard
- **Image Preview**: Real-time preview before upload
- **File Validation**: Size and type validation for uploads

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for secure API access
- **Midtrans** for payment processing
- **Cloudinary** for image management
- **Multer** for file uploads

### Frontend

- **React 18** with Vite build tool
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Midtrans account and API keys
- Cloudinary account and credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/drexjgobgt/simple-e-commerce-umkm
   cd ecommerce gas
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

1. **Backend Environment Variables** (`.env` in backend folder):

   ```env
   MONGODB_URI=mongodb://localhost:27017/toko-gas-umkm
   JWT_SECRET=your-jwt-secret-key
   PORT=5000

   # Midtrans Configuration
   MIDTRANS_SERVER_KEY=your-midtrans-server-key
   MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   MIDTRANS_IS_PRODUCTION=false

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Admin Registration
   ADMIN_SECRET_KEY=your-admin-secret-key
   ```

2. **Frontend Environment Variables** (`.env` in frontend folder):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
toko-gas-umkm/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── midtrans.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── payment.js
│   │   ├── products.js
│   │   └── upload.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PaymentSetupTab.jsx
│   │   ├── pages/
│   │   │   ├── Admin.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── RegisterVendor.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Customer registration
- `POST /api/auth/register-vendor` - Vendor registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/vendor-profile` - Update vendor profile
- `PUT /api/auth/vendor-profile/payment` - Update payment credentials

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders (authenticated)
- `GET /api/orders` - Get vendor orders (admin only)
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Upload

- `POST /api/upload/image` - Upload image to Cloudinary

### Payment

- `POST /api/payment/create-token` - Create payment token
- `POST /api/payment/create-token-vendor` - Create vendor-specific payment token

## 🗄️ Database Schema

### User Model

```javascript
{
  email: String,
  password: String,
  name: String,
  role: "customer" | "admin",
  storeName: String,
  storeDescription: String,
  // ... other vendor fields
  midtransClientKey: String,
  midtransServerKey: String
}
```

### Product Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  image: String,
  unit: String,
  vendor: ObjectId // Reference to User
}
```

### Order Model

```javascript
{
  customer: ObjectId, // Reference to User
  customerName: String,
  email: String,
  phone: String,
  address: Object,
  items: Array,
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  vendorPayments: Array
}
```

## 🔐 Authentication & Authorization

- **JWT-based authentication** for secure API access
- **Role-based access control** (customer, admin/vendor)
- **Middleware protection** for sensitive routes
- **Token expiration** handling

## 💰 Payment Flow

1. **Order Creation**: Customer places order with selected products
2. **Payment Token Generation**: Midtrans generates payment token
3. **Payment Processing**: Customer completes payment via Midtrans
4. **Status Updates**: Real-time payment status tracking
5. **Vendor Distribution**: Automatic payment split to respective vendors

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Responsive grid layouts** for all screen sizes
- **Touch-friendly interfaces** for mobile users
- **Optimized images** with Cloudinary transformations

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
npm run build
# Deploy to your preferred hosting service (Heroku, Railway, etc.)
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting service (Vercel, Netlify, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Midtrans](https://midtrans.com/) for payment processing
- [Cloudinary](https://cloudinary.com/) for image management
- [MongoDB](https://mongodb.com/) for database
- [React](https://reactjs.org/) for frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Made with ❤️ for Indonesian UMKM entrepreneurs**
