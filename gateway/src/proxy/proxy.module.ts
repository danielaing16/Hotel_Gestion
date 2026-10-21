import { Module } from '@nestjs/common';
import { ReverseProxyMiddleware } from './proxy.middleware';

@Module({
  providers: [ReverseProxyMiddleware],
  exports: [ReverseProxyMiddleware],
})
export class ProxyModule {}
