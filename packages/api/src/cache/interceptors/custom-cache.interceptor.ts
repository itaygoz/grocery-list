import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY_PATTERN } from '../constans';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CustomCacheInterceptor.name);
  private allowedMethods = ['GET'];

  constructor(
    @Inject('CACHE_MANAGER')
    private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const req = context.switchToHttp().getRequest();

    const { cacheParams } = req;

    const keyPattern = this.reflector.get<string>(CACHE_KEY_PATTERN, handler);

    if (
      !keyPattern ||
      !cacheParams ||
      !this.allowedMethods.includes(req.method)
    ) {
      return next.handle();
    }

    let cacheKey = keyPattern;

    // Replace placeholders in the cache key pattern with actual values from cacheParams
    Object.entries<string>(cacheParams).forEach(([placeholder, value]) => {
      cacheKey = cacheKey.replace(`{${placeholder}}`, value);
    });

    const cachedValue = await this.cacheManager.get(cacheKey);
    if (cachedValue) {
      this.logger.verbose(`Cache hit ${cacheKey}`);
      return of(cachedValue);
    }

    return next.handle().pipe(
      tap(async (result) => {
        this.logger.verbose(`Cache miss ${cacheKey} setting value: ${result}`);
        await this.cacheManager.set(cacheKey, result);
      }),
    );
  }
}
