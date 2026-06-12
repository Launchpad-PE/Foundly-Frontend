import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');

  console.log('🔐 [Interceptor] URL:', req.url);
  console.log('🔐 [Interceptor] Método:', req.method);
  console.log('🔐 [Interceptor] Token existe:', !!token);

  if (!token || req.url.includes('/authentication/')) {
    console.log('🔐 [Interceptor] NO se agrega token');
    return next(req);
  }

  console.log('🔐 [Interceptor] SE AGREGA token');
  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(cloned);
};
