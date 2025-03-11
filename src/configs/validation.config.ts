import { ValidationPipe } from '@nestjs/common';

export const validationConfig = new ValidationPipe({
  whitelist: true,
  stopAtFirstError: true,
  forbidUnknownValues: true,
});
