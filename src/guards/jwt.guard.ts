import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload, decode } from 'jsonwebtoken';
import { Observable } from 'rxjs';

interface DecodedToken extends JwtPayload {
  sub: string;
  customRole?: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRoles = this.reflector.get<string[]>(
      'allowedRoles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException(`Unauthorized`);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(`Unauthorized`);
    }

    let decoded: DecodedToken;
    try {
      decoded = decode(token) as DecodedToken;
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid Token');
    }

    const userRole = decoded['custom:role'] || '';
    request.user = {
      id: decoded.sub,
      role: userRole,
    };

    console.log({ allowedRoles });
    console.log({ userRole });

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole.toLowerCase())) {
        throw new ForbiddenException(`Access Denied`);
      }
    }
    return true;
  }
}
