import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { clientDb } from '../utils/db';

@Injectable()
export class AgencyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const pathParts = req.path.split('/');
    const pIndex = pathParts.indexOf('p');
    const slug = pIndex !== -1 ? pathParts[pIndex + 1] : undefined;

    if (slug && typeof slug === 'string') {
      const agency = await clientDb.agency.findUnique({
        where: { slug },
      });

      if (agency) {
        res.cookie('agency_id', agency.id, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, 
        });
      }
    }
    next();
  }
}
