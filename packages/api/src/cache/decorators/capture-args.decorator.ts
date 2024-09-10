import { SetMetadata } from '@nestjs/common';

export const CaptureArgs =
  () => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Store the arguments in the context metadata
      SetMetadata('CUSTOM_ARGS_METADATA', args)(target, key, descriptor);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
