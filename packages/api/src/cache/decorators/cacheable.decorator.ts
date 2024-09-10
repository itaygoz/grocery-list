import { SetMetadata, applyDecorators } from '@nestjs/common';
import { CACHE_KEY_PATTERN } from '../constans';

/**
 * Decorator that specifies the cache key pattern to be used in caching logic.
 * Placeholders in the pattern should correspond to method parameters decorated with `@CacheKeyParam`.
 *
 * @param {string} keyPattern - The pattern for the cache key, with placeholders for dynamic values.
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

export const Cacheable = (keyPattern: string) =>
  applyDecorators(
    SetMetadata(CACHE_KEY_PATTERN, keyPattern),
    // UseInterceptors(CustomCacheInterceptor),
  );
