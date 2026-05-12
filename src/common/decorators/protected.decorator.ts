import { Reflector } from '@nestjs/core';

export const protectedKey = 'protectedKey';
export const Protected = Reflector.createDecorator<boolean>({
  key: protectedKey,
});
