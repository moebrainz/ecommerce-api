# **Database Schema & Migrations Guide**

## **📊 MongoDB Schema Overview**

Since this project uses **MongoDB with Mongoose ODM**, there are no traditional SQL migrations. Instead, schemas are defined in code and MongoDB handles schema evolution dynamically. Below is a comprehensive overview of all database schemas.

---

## **🏗️ Database Collections & Schemas**

### **1. Users Collection**

```typescript
// Collection: users
{
  _id: ObjectId,           // Auto-generated
  email: String,           // Required, unique
  password: String,        // Required, hashed
  name: String,            // Optional
  role: String,            // Enum: 'USER' | 'ADMIN', default: 'USER'
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { email: 1 } (unique)
```

### **2. Categories Collection**

```typescript
// Collection: categories
{
  _id: ObjectId,           // Auto-generated
  name: String,            // Required, unique
  slug: String,            // Required, unique (URL-friendly)
  description: String,     // Optional
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { name: 1 } (unique)
- { slug: 1 } (unique)
```

### **3. Products Collection**

```typescript
// Collection: products
{
  _id: ObjectId,           // Auto-generated
  name: String,            // Required
  description: String,     // Required
  sku: String,             // Optional, unique, sparse
  slug: String,            // Optional, unique, sparse
  price: Number,           // Required
  stock: Number,           // Required
  isActive: Boolean,       // Default: true
  categoryId: ObjectId,    // Reference to categories collection
  images: [{               // Array of product images
    _id: ObjectId,         // Auto-generated
    url: String,           // Required
    createdAt: Date        // Default: now
  }],
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { sku: 1 } (unique, sparse)
- { slug: 1 } (unique, sparse)
- { categoryId: 1 }
- { isActive: 1 }
```

### **4. Addresses Collection**

```typescript
// Collection: addresses
{
  _id: ObjectId,           // Auto-generated
  userId: ObjectId,        // Required, reference to users
  street: String,          // Required
  city: String,            // Required
  state: String,           // Required
  zipCode: String,         // Required
  country: String,         // Required
  isDefault: Boolean,      // Default: false
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { userId: 1 }
```

### **5. Carts Collection**

```typescript
// Collection: carts
{
  _id: ObjectId,           // Auto-generated
  userId: ObjectId,        // Required, unique, reference to users
  items: [{                // Array of cart items
    _id: ObjectId,         // Auto-generated
    productId: ObjectId,   // Required, reference to products
    quantity: Number       // Required
  }],
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { userId: 1 } (unique)
```

### **6. Orders Collection**

```typescript
// Collection: orders
{
  _id: ObjectId,           // Auto-generated
  userId: ObjectId,        // Required, reference to users
  items: [{                // Array of order items
    _id: ObjectId,         // Auto-generated
    productId: ObjectId,   // Required, reference to products
    quantity: Number,      // Required
    price: Number          // Required (price at time of order)
  }],
  totalAmount: Number,     // Required
  status: String,          // Enum: PENDING|PAID|SHIPPED|DELIVERED|CANCELLED
  addressId: ObjectId,     // Optional, reference to addresses
  payments: [{             // Array of payments
    _id: ObjectId,         // Auto-generated
    amount: Number,        // Required
    method: String,        // Required
    transactionId: String, // Optional, unique, sparse
    status: String,        // Default: 'PENDING'
    createdAt: Date,       // Default: now
    updatedAt: Date        // Default: now
  }],
  statusHistory: [{        // Array of status changes
    _id: ObjectId,         // Auto-generated
    status: String,        // Required, enum
    changedAt: Date        // Default: now
  }],
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { userId: 1 }
- { status: 1 }
- { addressId: 1 }
```

### **7. Reviews Collection**

```typescript
// Collection: reviews
{
  _id: ObjectId,           // Auto-generated
  productId: ObjectId,     // Required, reference to products
  userId: ObjectId,        // Required, reference to users
  rating: Number,          // Required (1-5)
  comment: String,         // Optional
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}

// Indexes:
- { productId: 1, userId: 1 } (unique compound)
- { productId: 1 }
- { userId: 1 }
```

---

## **🔄 Schema Migration Strategy**

### **MongoDB Schema Evolution**

Since MongoDB is schema-less, migrations work differently than relational databases:

1. **Backward Compatibility**: New fields can be added without migration
2. **Data Migration**: Required when changing existing field types or removing fields
3. **Index Management**: Indexes are created/updated via code changes

### **Migration Patterns**

#### **Adding New Fields**

```typescript
// Simply add the field to the schema - MongoDB handles it automatically
@Prop({ default: 'default_value' })
newField?: string;
```

#### **Changing Field Types**

```typescript
// Requires data migration script
// 1. Create migration script to update existing documents
// 2. Update schema definition
// 3. Deploy both changes together
```

#### **Adding Indexes**

```typescript
// Add to schema file
SchemaName.index({ fieldName: 1 });

// Or compound indexes
SchemaName.index({ field1: 1, field2: -1 });
```

#### **Removing Fields (Breaking Change)**

```typescript
// 1. Create migration to handle data migration/cleanup
// 2. Remove field from schema
// 3. Update application code
```

---

## **🛠️ Migration Scripts**

### **Creating a Migration Script**

```typescript
// migrations/001_add_user_phone.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AddUserPhoneMigration {
  constructor(@InjectConnection() private connection: Connection) {}

  async up() {
    const db = this.connection.db;
    const collection = db.collection('users');

    // Add phone field to all existing users
    await collection.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: null } },
    );
  }

  async down() {
    const db = this.connection.db;
    const collection = db.collection('users');

    // Remove phone field
    await collection.updateMany({}, { $unset: { phone: 1 } });
  }
}
```

### **Running Migrations**

```typescript
// In a service or module
async runMigrations() {
  const migration = new AddUserPhoneMigration(this.connection);
  await migration.up();
}
```

---

## **📊 Database Relationships**

```
Users (1) ──── (M) Addresses
Users (1) ──── (1) Carts
Users (1) ──── (M) Orders
Users (1) ──── (M) Reviews

Categories (1) ─── (M) Products

Products (1) ──── (M) CartItems
Products (1) ──── (M) OrderItems
Products (1) ──── (M) Reviews

Orders (1) ──── (1) Addresses
Orders (1) ──── (M) Payments

Carts contain embedded CartItems
Orders contain embedded OrderItems
Products contain embedded ProductImages
```

---

## **🔍 Query Optimization**

### **Current Indexes**

- **Users**: `email` (unique)
- **Categories**: `name`, `slug` (unique)
- **Products**: `sku`, `slug` (unique, sparse), `categoryId`, `isActive`
- **Addresses**: `userId`
- **Orders**: `userId`, `status`, `addressId`
- **Reviews**: `productId,userId` (compound unique), `productId`, `userId`

### **Recommended Additional Indexes**

```typescript
// For order analytics
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ 'items.productId': 1 });

// For product search
ProductSchema.index({ name: 'text', description: 'text' });

// For user activity
ReviewSchema.index({ createdAt: -1 });
```

---

## **🧪 Seed Data**

### **Development Seed Script**

```typescript
// scripts/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { ProductsService } from '../src/products/products.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const productsService = app.get(ProductsService);

  // Create admin user
  await usersService.create({
    email: 'admin@example.com',
    password: 'hashed_password',
    name: 'Admin User',
    role: 'ADMIN',
  });

  // Create sample products
  await productsService.create({
    name: 'Sample Product',
    description: 'A sample product for testing',
    price: 29.99,
    stock: 100,
  });

  await app.close();
}

seed();
```

---

## **📈 Database Maintenance**

### **Backup Strategy**

```bash
# Using mongodump
mongodump --db ecommerce --out /backup/$(date +%Y%m%d)

# Using docker
docker exec mongodb mongodump --db ecommerce --out /backup
```

### **Monitoring Queries**

```javascript
// Enable profiling
db.setProfilingLevel(2, { slowms: 100 });

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

### **Index Optimization**

```javascript
// Analyze index usage
db.products.aggregate([{ $indexStats: {} }]);

// Remove unused indexes
db.products.dropIndex('index_name');
```

---

## **🚀 Deployment Considerations**

### **Environment-Specific Configurations**

- **Development**: Single MongoDB instance
- **Staging**: Replica set for testing
- **Production**: Sharded cluster with replicas

### **Connection Settings**

```typescript
// Production connection
MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    bufferMaxEntries: 0,
  }),
});
```
