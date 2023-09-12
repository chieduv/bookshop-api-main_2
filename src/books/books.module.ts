import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookController } from './books.controller';
import { BookService } from './books.service';
import { Book, BookSchema } from './entities/book.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // MongooseModule.forRoot(process.env.DB_URI),
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    AuthModule,
  ],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
