import { ConfigModule } from '@nestjs/config';
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
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AddressModule } from './address/address.module';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
<<<<<<< HEAD
import { OrdersModule } from './users/orders.module';
import { ReviewModule } from './review/review.module';
=======
import { ReportModule } from './report/report.module';
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
<<<<<<< HEAD
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '123',
      database: process.env.DB_NAME || 'khmer_vegetable_market',
      autoLoadEntities: true,
      synchronize: true, // set to false in production
    }),
=======
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'vegetable',
    autoLoadEntities: true,
    synchronize: true,
  }),
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c
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
    AddressModule,
    MailModule,
    OrdersModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
