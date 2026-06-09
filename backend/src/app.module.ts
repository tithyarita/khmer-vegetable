import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { ProvidersModule } from './providers/providers.module';
import { ApplicationsModule } from './providers/applications.module';
import { ProductModule } from './product/product.module';
import { ProviderApplicationsModule } from './provider-application/provider-application.module';
import { CartModule } from './cart/cart.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ReportModule } from './report/report.module';
import { ReviewModule } from './review/review.module';
import { OrdersModule } from './users/orders.module';
import { AddressModule } from './address/address.module';
import { MailModule } from './mail/mail.module';
import { NavigationModule } from './navigation/navigation.module';

import { AppController } from './app.controller';
import { VerifyController } from './verify/verify.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER || 'root',
<<<<<<< HEAD
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'khmer_vegetable_market',
=======
      password: process.env.DB_PASSWORD || '123456789',
      database: process.env.DB_NAME || 'Khmer_vegetable',
>>>>>>> 5a6a846a9edf8208db03a3db0d5c7dd98fb3ba39

      autoLoadEntities: true,
      synchronize: true,
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    StaffModule,
    AdminModule,
    ProvidersModule,
    ApplicationsModule,
    ProductModule,
    ProviderApplicationsModule,
    ReportModule,
    CartModule,
    FavoriteModule,
    ReviewModule,
    OrdersModule,
    AddressModule,
    MailModule,
    NavigationModule,
  ],

  controllers: [AppController, VerifyController],

  providers: [AppService],
})
export class AppModule {}
