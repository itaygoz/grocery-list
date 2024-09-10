/**
 * Decorator that associates a method parameter with a placeholder in the cache key.
 *
 * @param {string} placeholder - The placeholder in the cache key that this parameter will replace.
 *
 * @example
 *
 * @Cacheable('user:{userId}:list:{listId}')
 * getList(
 *   @CacheKeyParam('userId') @User() { userId }: UserDto,
 *   @CacheKeyParam('listId') @Param('id') listId: string,
 * ) {
 *   return this.service.getList(listId);
 * }
 */

import {
  createParamDecorator,
  ExecutionContext,
  UsePipes,
} from '@nestjs/common';
import { CacheKeyParamPipe } from '../pipes/cache-key-param.pipe';

export const CacheKeyParam = (key: string) =>
  createParamDecorator(
    // (data: unknown, ctx: ExecutionContext) => {
    //   const request = ctx.switchToHttp().getRequest();

    //   return data;
    // },
    UsePipes(
      (data: unknown, ctx: ExecutionContext) =>
        new CacheKeyParamPipe(ctx.switchToHttp().getRequest(), key),
    ),
  )();
