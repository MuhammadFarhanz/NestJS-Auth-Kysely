import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof ZodValidationException) {
      response.status(400).json({
        errors: exception,
      });
    } else if (exception instanceof UnauthorizedException) {
      response.status(401).json({
        errors: exception,
      });
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
