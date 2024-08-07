# Grocery List Management App Design Document

## Overview

This document outlines the design of a grocery list management application that learns from past lists and predicts future items. The application is built using NestJS, MongoDB, and Redis, ensuring a responsive and scalable system.

## Project Structure

```
src
├── app.module.ts
├── main.ts
├── user
│   ├── user.module.ts
│   ├── user.service.ts
│   ├── user.controller.ts
│   ├── schemas
│   │   └── user.schema.ts
├── list
│   ├── list.module.ts
│   ├── list.service.ts
│   ├── list.controller.ts
│   ├── schemas
│   │   └── list.schema.ts
├── item
│   ├── item.module.ts
│   ├── item.service.ts
│   ├── item.controller.ts
│   ├── schemas
│   │   └── item.schema.ts
```

## Key Features

1. **User Management:** Handle user-related operations.
2. **List Management:** Create and manage grocery lists.
3. **Item Management:** Track items, categorize them, and handle user-specific inputs.
4. **Predictive Analytics:** Learn from past lists and predict future items.
5. **Session Management:** Handle list editing sessions using Redis for real-time responsiveness.

## Database Schema

### User Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop([{ type: Schema.Types.ObjectId, ref: 'List' }])
  lists: List[];
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### List Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class List extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop([{ itemId: String, quantity: Number }])
  items: { itemId: string; quantity: number }[];

  @Prop([
    {
      timestamp: Date,
      action: String,
      item: {
        itemId: String,
        quantity: Number,
      },
    },
  ])
  changelog: {
    timestamp: Date;
    action: string;
    item: { itemId: string; quantity: number };
  }[];
}

export const ListSchema = SchemaFactory.createForClass(List);
```

### Item Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Item extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
```

## Modules and Services

### User Module

**user.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
```

**user.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(username: string, password: string): Promise<User> {
    const newUser = new this.userModel({ username, password });
    return newUser.save();
  }

  async getUserById(userId: string): Promise<User> {
    return this.userModel.findById(userId).populate('lists').exec();
  }
}
```

**user.controller.ts**

```typescript
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.userService.createUser(username, password);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
```

### List Module

**list.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { List, ListSchema } from './schemas/list.schema';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: List.name, schema: ListSchema }]),
    ItemModule,
  ],
  providers: [ListService],
  controllers: [ListController],
})
export class ListModule {}
```

**list.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { List } from './schemas/list.schema';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ItemService } from '../item/item.service';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<List>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private itemService: ItemService,
  ) {}

  async startEditing(userId: string, listId: string): Promise<any> {
    const currentList = await this.cacheManager.get(
      `user:${userId}:list:${listId}`,
    );
    if (currentList) {
      return JSON.parse(currentList);
    } else {
      const newList = [];
      await this.cacheManager.set(
        `user:${userId}:list:${listId}`,
        JSON.stringify(newList),
        { ttl: 900 },
      );
      return newList;
    }
  }

  async addItem(
    userId: string,
    listId: string,
    item: { name: string; category: string; quantity: number },
  ): Promise<any> {
    const currentList = JSON.parse(
      await this.cacheManager.get(`user:${userId}:list:${listId}`),
    );

    const itemDoc = await this.itemService.findOrCreate(
      item.name,
      item.category,
    );
    currentList.push({ itemId: itemDoc._id, quantity: item.quantity });

    await this.cacheManager.set(
      `user:${userId}:list:${listId}`,
      JSON.stringify(currentList),
      { ttl: 900 },
    );

    this.listModel.findByIdAndUpdate(
      listId,
      {
        items: currentList,
        $push: {
          changelog: {
            timestamp: new Date(),
            action: 'add',
            item: { itemId: itemDoc._id, quantity: item.quantity },
          },
        },
      },
      { upsert: true },
      (err) => {
        if (err) console.error(err);
      },
    );

    return currentList;
  }

  async removeItem(
    userId: string,
    listId: string,
    itemId: string,
  ): Promise<any> {
    const currentList = JSON.parse(
      await this.cacheManager.get(`user:${userId}:list:${listId}`),
    );
    const updatedList = currentList.filter((item) => item.itemId !== itemId);
    await this.cacheManager.set(
      `user:${userId}:list:${listId}`,
      JSON.stringify(updatedList),
      { ttl: 900 },
    );

    this.listModel.findByIdAndUpdate(
      listId,
      {
        items: updatedList,
        $push: {
          changelog: {
            timestamp: new Date(),
            action: 'remove',
            item: { itemId },
          },
        },
      },
      { upsert: true },
      (err) => {
        if (err) console.error(err);
      },
    );

    return updatedList;
  }

  async createList(userId: string, listName: string): Promise<List> {
    const newList = new this.listModel({
      userId,
      name: listName,
      items: [],
      changelog: [],
    });
    await newList.save();
    return newList;
  }

  async getLists(userId: string): Promise<List[]> {
    return this.listModel.find({ userId });
  }
}
```

**list.controller.ts**

```typescript
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ListService } from './list.service';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post('create')
  async createList(@Body('userId') userId: string, @Body('name') name: string) {
    return this.listService.createList(userId, name);
  }

  @Get('user/:userId')
  async getLists(@Param('userId') userId: string) {
    return this.listService.getLists(userId);
  }

  @Post('edit/:listId/start')
  async startEditing(
    @Param('listId') listId: string,
    @Body('userId') userId: string,
  ) {
    return this.listService.startEditing(userId, listId);
  }

  @Patch('edit/:listId/add')
  async addItem(
    @Param('listId') listId: string,
    @Body()
    addItemDto: {
      userId: string;
      name: string;
      category: string;
      quantity: number;
    },
  ) {
    const { userId, name, category, quantity } = addItemDto;
    return this.listService.addItem(userId, listId, {
      name,
      category,
      quantity,
    });
  }

  @Patch('edit/:listId/remove')
  async removeItem(
    @Param('listId') listId: string,
    @Body() removeItemDto: { userId: string; itemId: string },
  ) {
    const { userId, itemId } = removeItemDto;
    return this.listService.removeItem(userId, listId, itemId);
  }
}
```

### Item Module

**item.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item, ItemSchema } from './schemas/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
  ],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService],
})
export class ItemModule {}
```

**item.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';

@Injectable()
export class ItemService {
  constructor(@InjectModel(Item.name) private itemModel: Model<Item>) {}

  async findOrCreate(name: string, category: string): Promise<Item> {
    // Try to find the item in the database
    let item = await this.itemModel.findOne({ name }).exec();

    if (!item) {
      // If item does not exist, create it
      item = new this.itemModel({ name, category });
      // Save item in background (asynchronous)
      this.itemModel.create(item);
    }

    return item;
  }

  async getAllCategories(): Promise<string[]> {
    const items = await this.itemModel.find().exec();
    const categories = items.map((item) => item.category);
    return Array.from(new Set(categories));
  }
}
```

**item.controller.ts**

```typescript
import { Controller, Post, Body, Get } from '@nestjs/common';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post('find-or-create')
  async findOrCreate(
    @Body('name') name: string,
    @Body('category') category: string,
  ) {
    return this.itemService.findOrCreate(name, category);
  }

  @Get('categories')
  async getAllCategories() {
    return this.itemService.getAllCategories();
  }
}
```

## Redis Session Management

### Overview

- **Session Initialization:** When a user starts editing a list, a session is created in Redis with a TTL (Time to Live).
- **Item Addition/Removal:** Each operation updates the session data in Redis and asynchronously updates the MongoDB list document.
- **Session Expiry:** Sessions expire after a defined period, and final state is saved in MongoDB.

### Code Example

**Session Handling in `list.service.ts`**

```typescript
async startEditing(userId: string, listId: string): Promise<any> {
  const currentList = await this.cacheManager.get(`user:${userId}:list:${listId}`);
  if (currentList) {
    return JSON.parse(currentList);
  } else {
    const newList = [];
    await this.cacheManager.set(`user:${userId}:list:${listId}`, JSON.stringify(newList), { ttl: 900 });
    return newList;
  }
}

async addItem(userId: string, listId: string, item: { name: string; category: string; quantity: number }): Promise<any> {
  const currentList = JSON.parse(await this.cacheManager.get(`user:${userId}:list:${listId}`));

  const itemDoc = await this.itemService.findOrCreate(item.name, item.category);
  currentList.push({ itemId: itemDoc._id, quantity: item.quantity });

  await this.cacheManager.set(`user:${userId}:list:${listId}`, JSON.stringify(currentList), { ttl: 900 });

  this.listModel.findByIdAndUpdate(
    listId,
    {
      items: currentList,
      $push: { changelog: { timestamp: new Date(), action: 'add', item: { itemId: itemDoc._id, quantity: item.quantity } } },
    },
    { upsert: true },
    (err) => {
      if (err) console.error(err);
    },
  );

  return currentList;
}

async removeItem(userId: string, listId: string, itemId: string): Promise<any> {
  const currentList = JSON.parse(await this.cacheManager.get(`user:${userId}:list:${listId}`));
  const updatedList = currentList.filter(item => item.itemId !== itemId);
  await this.cacheManager.set(`user:${userId}:list:${listId}`, JSON.stringify(updatedList), { ttl: 900 });

  this.listModel.findByIdAndUpdate(
    listId,
    {
      items: updatedList,
      $push: { changelog: { timestamp: new Date(), action: 'remove', item: { itemId } } },
    },
    { upsert: true },
    (err) => {
      if (err) console.error(err);
    },
  );

  return updatedList;
}
```

## Predictive Analytics

### Overview

- **Data Collection:** Collect data on user interactions with lists.
- **Prediction Model:** Use TensorFlow to create a model that predicts future items based on past lists.
- **Execution:** The prediction job runs periodically, and predictions are stored for each user.

### Example TensorFlow Model (Python)

```python
import tensorflow as tf
import numpy as np

# Example training data
data = [
    # user_id, item_id, quantity, week
    [1, 101, 2, 1],
    [1, 101, 2, 2],
    [1, 102, 1, 1],
    # more data...
]

# Convert to numpy array
data = np.array(data)

# Split data
train_x = data[:, :-1]
train_y = data[:, -1]

# Define model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1)
])

# Compile model
model.compile(optimizer='adam', loss='mean_squared_error')

# Train model
model.fit(train_x, train_y, epochs=10)

# Save model
model.save('prediction_model.h5')
```

## Conclusion

This design document outlines the architecture and implementation details for a responsive and scalable grocery list management application. The use of NestJS, MongoDB, and Redis ensures efficient data handling and real-time responsiveness. The predictive analytics component provides personalized recommendations to enhance the user experience.

---
