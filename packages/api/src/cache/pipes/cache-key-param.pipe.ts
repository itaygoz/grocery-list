import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class CacheKeyParamPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private key: string,
  ) {
    console.log(request);
  }
  transform(value: string, args: ArgumentMetadata) {
    // Store the value in the request (via context) for caching purposes
    this.request.cacheParams ?? {};
    this.request.cacheParams[this.key] = value;

    return value; // Pass along the value as expected
  }
}
